const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// Helper to generate JWT token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'your_jwt_secret_key_here_change_this_in_production', {
        expiresIn: process.env.JWT_EXPIRE || '7d'
    });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
router.post('/register', async (req, res) => {
    try {
        const { fullname, email, phone } = req.body;

        if (!fullname || !email || !phone) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all details (fullname, email, phone)'
            });
        }

        // Check if user already exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({
                success: false,
                exists: true,
                message: 'User already exists with this email'
            });
        }

        // Create new user (using a random password since login is passwordless)
        const password = Math.random().toString(36).substring(2, 10);
        const user = await User.create({
            fullname,
            email,
            phone,
            password
        });

        if (user) {
            res.status(201).json({
                success: true,
                token: generateToken(user._id),
                user: {
                    id: user._id,
                    fullname: user.fullname,
                    email: user.email,
                    phone: user.phone,
                    role: user.role
                }
            });
        } else {
            res.status(400).json({
                success: false,
                message: 'Invalid user data'
            });
        }
    } catch (error) {
        console.error('Register Error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during registration',
            error: error.message
        });
    }
});

// @desc    Auth user & get token (Passwordless email login)
// @route   POST /api/auth/login
// @access  Public
router.post('/login', async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Please provide an email'
            });
        }

        const user = await User.findOne({ email });

        if (user) {
            res.json({
                success: true,
                token: generateToken(user._id),
                user: {
                    id: user._id,
                    fullname: user.fullname,
                    email: user.email,
                    phone: user.phone,
                    role: user.role
                }
            });
        } else {
            res.status(401).json({
                success: false,
                message: 'Invalid email address. Please sign up first.'
            });
        }
    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during login',
            error: error.message
        });
    }
});

// @desc    Google Sign-In Authentication (Login or register automatically)
// @route   POST /api/auth/google
// @access  Public
router.post('/google', async (req, res) => {
    try {
        const { fullname, email, phone } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email is required for Google Sign-In'
            });
        }

        let user = await User.findOne({ email });

        if (!user) {
            // Register new user with random password
            const password = Math.random().toString(36).substring(2, 10);
            user = await User.create({
                fullname: fullname || email.split('@')[0],
                email,
                phone: phone || 'N/A',
                password
            });
        }

        res.json({
            success: true,
            token: generateToken(user._id),
            user: {
                id: user._id,
                fullname: user.fullname,
                email: user.email,
                phone: user.phone,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Google Auth Error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during Google auth',
            error: error.message
        });
    }
});

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
router.get('/me', protect, async (req, res) => {
    try {
        res.json({
            success: true,
            user: {
                id: req.user._id,
                fullname: req.user.fullname,
                email: req.user.email,
                phone: req.user.phone,
                role: req.user.role,
                addresses: req.user.addresses
            }
        });
    } catch (error) {
        console.error('Me Profile Error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching user profile'
        });
    }
});

module.exports = router;
