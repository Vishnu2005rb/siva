const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// @desc    Update user profile or address
// @route   PUT /api/users/profile
// @access  Private
router.put('/profile', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (user) {
            user.fullname = req.body.fullname || user.fullname;
            user.phone = req.body.phone || user.phone;

            if (req.body.addresses) {
                user.addresses = req.body.addresses;
            } else if (req.body.address) {
                // Add a single shipping address if provided
                user.addresses.push({
                    firstName: req.body.firstName || user.fullname.split(' ')[0],
                    lastName: req.body.lastName || user.fullname.split(' ')[1] || '',
                    address: req.body.address,
                    city: req.body.city,
                    state: req.body.state,
                    pincode: req.body.pincode,
                    country: req.body.country || 'India',
                    isDefault: true
                });
            }

            const updatedUser = await user.save();

            res.json({
                success: true,
                user: {
                    id: updatedUser._id,
                    fullname: updatedUser.fullname,
                    email: updatedUser.email,
                    phone: updatedUser.phone,
                    role: updatedUser.role,
                    addresses: updatedUser.addresses
                }
            });
        } else {
            res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
    } catch (error) {
        console.error('Update User Error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error updating profile',
            error: error.message
        });
    }
});

module.exports = router;
