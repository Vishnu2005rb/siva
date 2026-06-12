const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const Razorpay = require('razorpay');
const Product = require('../models/Product');
const Order = require('../models/Order');
const { protect } = require('../middleware/auth');

// Initialize Razorpay
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_T0k8hRrpfw9IiQ',
    key_secret: process.env.RAZORPAY_KEY_SECRET || '9XUYFz0YJ6RPFaOulcPo3Pno'
});

// @desc    Create a Razorpay order
// @route   POST /api/payment/create-order
// @access  Private
router.post('/create-order', protect, async (req, res) => {
    try {
        const { amount, items } = req.body;

        if (!items || items.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No items in the order'
            });
        }

        if (!amount || amount <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Invalid amount'
            });
        }

        // Validate product price from database
        let computedSubtotal = 0;
        for (const item of items) {
            const product = await Product.findById(item.id || item._id);
            if (!product) {
                return res.status(404).json({
                    success: false,
                    message: `Product with ID ${item.id || item._id} not found`
                });
            }
            computedSubtotal += product.price * item.quantity;
        }

        // Validate calculated total
        // Using a tolerance check for floating point comparisons
        if (Math.abs(computedSubtotal - amount) > 0.01) {
            return res.status(400).json({
                success: false,
                message: `Price mismatch. Expected Subtotal: ₹${computedSubtotal}, Received: ₹${amount}`
            });
        }

        // Convert amount from rupees to paise
        const amountInPaise = Math.round(amount * 100);

        // Create Razorpay order
        const options = {
            amount: amountInPaise,
            currency: 'INR',
            receipt: `receipt_${Date.now()}`
        };

        const razorpayOrder = await razorpay.orders.create(options);

        res.status(200).json({
            success: true,
            order_id: razorpayOrder.id,
            amount: razorpayOrder.amount,
            currency: razorpayOrder.currency
        });

    } catch (error) {
        console.error('Create Razorpay Order Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating payment order',
            error: error.message
        });
    }
});

// @desc    Verify Razorpay payment signature
// @route   POST /api/payment/verify
// @access  Private
router.post('/verify', protect, async (req, res) => {
    try {
        const {
            dbOrderId,
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature
        } = req.body;

        if (!dbOrderId || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return res.status(400).json({
                success: false,
                message: 'Missing verification parameters'
            });
        }

        // Find database order
        const order = await Order.findById(dbOrderId);
        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found in database'
            });
        }

        // Verify signature using Razorpay secret key
        const keySecret = process.env.RAZORPAY_KEY_SECRET || '9XUYFz0YJ6RPFaOulcPo3Pno';
        const hmac = crypto.createHmac('sha256', keySecret);
        hmac.update(razorpay_order_id + '|' + razorpay_payment_id);
        const generatedSignature = hmac.digest('hex');

        if (generatedSignature === razorpay_signature) {
            // Signature is valid: payment success
            order.paymentMethod = 'RAZORPAY';
            order.paymentStatus = 'completed';
            order.orderStatus = 'processing';
            order.razorpayOrderId = razorpay_order_id;
            order.razorpayPaymentId = razorpay_payment_id;
            order.paymentDate = new Date();
            order.paymentDetails = {
                transactionId: razorpay_payment_id,
                paidAt: new Date()
            };

            await order.save();

            res.status(200).json({
                success: true,
                message: 'Payment verified and order completed successfully',
                order
            });
        } else {
            // Signature invalid
            order.paymentStatus = 'failed';
            await order.save();

            res.status(400).json({
                success: false,
                message: 'Invalid payment signature verification failed'
            });
        }

    } catch (error) {
        console.error('Verify Payment Error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error verifying payment',
            error: error.message
        });
    }
});

module.exports = router;
