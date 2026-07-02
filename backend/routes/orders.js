const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const { protect } = require('../middleware/auth');

// @desc    Place a new order
// @route   POST /api/orders
// @access  Private
router.post('/', protect, async (req, res) => {
    try {
        const {
            items,
            shippingAddress,
            paymentMethod,
            paymentDetails,
            subtotal,
            deliveryCharges,
            tax,
            totalAmount
        } = req.body;

        if (!items || items.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No order items'
            });
        }

        // Create the order items mapping frontend product schema keys to model schema keys
        const orderItems = [];
        for (const item of items) {
            const product = await Product.findById(item.id || item._id);
            if (!product) {
                return res.status(404).json({
                    success: false,
                    message: `Product with ID ${item.id} not found`
                });
            }

            // Verify stock
            if (product.stock < item.quantity) {
                return res.status(400).json({
                    success: false,
                    message: `Insufficient stock for product: ${product.name}. Available: ${product.stock}`
                });
            }

            orderItems.push({
                product: product._id,
                name: product.name,
                price: item.price,
                quantity: item.quantity,
                size: item.size
            });

            // Decrement product stock
            product.stock -= item.quantity;
            await product.save();
        }

        // Create the order in the database
        const order = new Order({
            user: req.user._id,
            items: orderItems,
            shippingAddress,
            paymentMethod: paymentMethod.toLowerCase(),
            paymentStatus: paymentMethod.toLowerCase() === 'cod' ? 'pending' : 'completed',
            paymentDetails,
            subtotal: subtotal || totalAmount,
            deliveryCharges: deliveryCharges || 0,
            tax: tax || 0,
            totalAmount
        });

        const createdOrder = await order.save();

        res.status(201).json({
            success: true,
            orderId: createdOrder.orderId,
            order: createdOrder
        });

    } catch (error) {
        console.error('Place Order Error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error placing the order',
            error: error.message
        });
    }
});

// @desc    Get all orders (Admin only)
// @route   GET /api/orders
// @access  Private/Admin
router.get('/', protect, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized as an admin'
            });
        }

        const orders = await Order.find({})
            .populate('user', 'fullname email phone')
            .populate('items.product', 'name price image')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: orders.length,
            orders
        });
    } catch (error) {
        console.error('Get All Orders Error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error retrieving all orders',
            error: error.message
        });
    }
});

// @desc    Update order status (Admin only)
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
router.put('/:id/status', protect, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized as an admin'
            });
        }

        const { orderStatus } = req.body;
        if (!orderStatus) {
            return res.status(400).json({
                success: false,
                message: 'Order status is required'
            });
        }

        const order = await Order.findById(req.params.id);
        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        order.orderStatus = orderStatus;
        if (orderStatus === 'delivered') {
            order.deliveryDate = new Date();
        }

        await order.save();

        res.json({
            success: true,
            message: `Order status updated to ${orderStatus}`,
            order
        });
    } catch (error) {
        console.error('Update Order Status Error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error updating order status',
            error: error.message
        });
    }
});

// @desc    Get logged in user orders
// @route   GET /api/orders/my-orders
// @access  Private
router.get('/my-orders', protect, async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.json({
            success: true,
            count: orders.length,
            orders
        });
    } catch (error) {
        console.error('Get My Orders Error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error retrieving user orders',
            error: error.message
        });
    }
});

// @desc    Get order details by order ID
// @route   GET /api/orders/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('user', 'fullname email phone')
            .populate('items.product', 'name image');

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // Authorize: check if order belongs to user or user is admin
        if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(401).json({
                success: false,
                message: 'Not authorized to view this order'
            });
        }

        res.json({
            success: true,
            order
        });
    } catch (error) {
        console.error('Get Order Detail Error:', error);
        if (error.kind === 'ObjectId') {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }
        res.status(500).json({
            success: false,
            message: 'Server error retrieving order details',
            error: error.message
        });
    }
});

module.exports = router;
