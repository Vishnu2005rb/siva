const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// @desc    Get all products
// @route   GET /api/products
// @access  Public
router.get('/', async (req, res) => {
    try {
        const products = await Product.find({ isActive: true });
        res.json({
            success: true,
            count: products.length,
            products
        });
    } catch (error) {
        console.error('Get Products Error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error retrieving products',
            error: error.message
        });
    }
});

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        res.json({
            success: true,
            product
        });
    } catch (error) {
        console.error('Get Product Error:', error);
        if (error.kind === 'ObjectId') {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }
        res.status(500).json({
            success: false,
            message: 'Server error retrieving product',
            error: error.message
        });
    }
});

// @desc    Create a product (mainly for admin / dashboard / internal use)
// @route   POST /api/products
// @access  Public
router.post('/', async (req, res) => {
    try {
        const { name, description, price, size, category, stock, image, rating } = req.body;

        const product = await Product.create({
            name,
            description,
            price,
            size,
            category,
            stock,
            image,
            rating
        });

        res.status(201).json({
            success: true,
            product
        });
    } catch (error) {
        console.error('Create Product Error:', error);
        res.status(400).json({
            success: false,
            message: 'Error creating product',
            error: error.message
        });
    }
});

module.exports = router;
