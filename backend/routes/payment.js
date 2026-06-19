const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const Razorpay = require('razorpay');

const Product = require('../models/Product');
const Order = require('../models/Order');

const { protect } = require('../middleware/auth');


// ================================
// Initialize Razorpay
// ================================

const razorpay = new Razorpay({

    key_id: process.env.RAZORPAY_KEY_ID,

    key_secret: process.env.RAZORPAY_KEY_SECRET

});




// =================================
// Create Razorpay Order
// POST /api/payment/create-order
// Private
// =================================

router.post('/create-order', protect, async (req, res) => {


    try {


        const { amount, items } = req.body;



        if (!items || items.length === 0) {


            return res.status(400).json({

                success: false,

                message: "No items in the order"

            });


        }




        if (!amount || amount <= 0) {


            return res.status(400).json({

                success: false,

                message: "Invalid amount"

            });


        }





        // ==============================
        // Validate price from MongoDB
        // ==============================


        let computedSubtotal = 0;



        for (const item of items) {


            const product = await Product.findById(

                item.id || item._id

            );



            if (!product) {


                return res.status(404).json({

                    success: false,

                    message:
                        `Product with ID ${item.id || item._id} not found`

                });


            }



            computedSubtotal +=

                product.price * item.quantity;


        }




        if (

            Math.abs(

                computedSubtotal - amount

            ) > 0.01

        ) {


            return res.status(400).json({

                success: false,

                message:
                    `Price mismatch. Expected ₹${computedSubtotal}, Received ₹${amount}`

            });


        }




        // Rupees → Paise

        const amountInPaise =

            Math.round(amount * 100);





        const options = {


            amount: amountInPaise,


            currency: "INR",


            receipt:
                `receipt_${Date.now()}`


        };





        const razorpayOrder =

            await razorpay.orders.create(options);





        res.status(200).json({


            success: true,


            order_id:
                razorpayOrder.id,


            amount:
                razorpayOrder.amount,


            currency:
                razorpayOrder.currency


        });





    } catch (error) {



        console.error(

            "Create Payment Error:",

            error

        );



        res.status(500).json({


            success: false,


            message:
                "Error creating payment order",


            error: error.message


        });



    }


});






// =================================
// Verify Razorpay Payment
// POST /api/payment/verify
// Private
// =================================


router.post('/verify', protect, async (req, res) => {


    try {


        const {


            dbOrderId,


            razorpay_order_id,


            razorpay_payment_id,


            razorpay_signature


        } = req.body;






        if (

            !dbOrderId ||

            !razorpay_order_id ||

            !razorpay_payment_id ||

            !razorpay_signature

        ) {



            return res.status(400).json({


                success: false,


                message:
                    "Missing payment verification data"


            });



        }





        const order = await Order.findById(

            dbOrderId

        );





        if (!order) {


            return res.status(404).json({

                success: false,

                message: "Order not found"

            });


        }





        // =============================
        // Verify Razorpay Signature
        // =============================



        const hmac = crypto.createHmac(

            "sha256",

            process.env.RAZORPAY_KEY_SECRET

        );




        hmac.update(

            razorpay_order_id +

            "|" +

            razorpay_payment_id

        );




        const generatedSignature =

            hmac.digest("hex");






        if (

            generatedSignature ===

            razorpay_signature

        ) {



            order.paymentMethod =
                "RAZORPAY";



            order.paymentStatus =
                "completed";



            order.orderStatus =
                "processing";



            order.razorpayOrderId =
                razorpay_order_id;



            order.razorpayPaymentId =
                razorpay_payment_id;



            order.paymentDate =
                new Date();




            order.paymentDetails = {


                transactionId:
                    razorpay_payment_id,


                paidAt:
                    new Date()


            };





            await order.save();





            return res.status(200).json({


                success: true,


                message:
                    "Payment verified successfully",


                order


            });


        }



        else {



            order.paymentStatus =
                "failed";



            await order.save();




            return res.status(400).json({


                success: false,


                message:
                    "Payment verification failed"


            });


        }





    } catch (error) {



        console.error(

            "Verify Payment Error:",

            error

        );




        res.status(500).json({


            success: false,


            message:
                "Server error verifying payment",


            error: error.message


        });



    }



});





module.exports = router;