const express = require('express');
const router = express.Router();

const Product = require('../models/Product');
const { upload } = require('../config/cloudinary');


// ==========================
// Get all products
// GET /api/products
// ==========================

router.get('/', async (req, res) => {

    try {

        const products = await Product.find({
            isActive: true
        });


        res.json({
            success: true,
            count: products.length,
            products
        });


    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

});




// ==========================
// Get single product
// GET /api/products/:id
// ==========================

router.get('/:id', async (req, res) => {

    try {

        const product = await Product.findById(
            req.params.id
        );


        if (!product) {

            return res.status(404).json({
                success: false,
                message: "Product not found"
            });

        }


        res.json({
            success: true,
            product
        });


    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

});




// ==========================
// Create product + Cloudinary image upload
// POST /api/products
// ==========================

router.post(
    '/',
    upload.single("image"),

    async (req, res) => {





        try {


            const {
                name,
                description,
                price,
                size,
                category,
                stock,
                rating
            } = req.body;



            if (!name || !description || !price || !size) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Required fields missing"

                });

            }



            const product = await Product.create({


                name,

                description,


                price: Number(price),


                size,


                category: category || "Ghee",


                stock: Number(stock) || 0,


                rating: Number(rating) || 5,


                image: req.file
                    ? req.file.path
                    : ""


            });



            res.status(201).json({

                success: true,

                product

            });



        } catch (error) {


            console.log(
                "CREATE PRODUCT ERROR:",
                error
            );


            res.status(400).json({

                success: false,

                message: error.message

            });

        }

    }

);




// ==========================
// Update product + Cloudinary image upload
// PUT /api/products/:id
// ==========================

router.put(
    '/:id',
    upload.single("image"),

    async (req, res) => {


        try {


            const {
                name,
                description,
                price,
                size,
                category,
                stock,
                rating,
                isActive
            } = req.body;



            let updateData = {};


            if (name !== undefined) updateData.name = name;

            if (description !== undefined) updateData.description = description;

            if (price !== undefined) updateData.price = Number(price);

            if (size !== undefined) updateData.size = size;

            if (category !== undefined) updateData.category = category;

            if (stock !== undefined) updateData.stock = Number(stock);

            if (rating !== undefined) updateData.rating = Number(rating);

            if (isActive !== undefined) {

                updateData.isActive = isActive === 'true' || isActive === true;

            }


            if (req.file) {

                updateData.image = req.file.path;

            }



            const product = await Product.findByIdAndUpdate(
                req.params.id,
                updateData,
                { new: true }
            );



            if (!product) {


                return res.status(404).json({

                    success: false,

                    message: "Product not found"

                });


            }



            res.json({

                success: true,

                product

            });



        } catch (error) {


            console.log("UPDATE PRODUCT ERROR:", error);


            res.status(400).json({

                success: false,

                message: error.message

            });


        }

    }

);




module.exports = router;