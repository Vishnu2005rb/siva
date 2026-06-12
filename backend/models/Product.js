const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide product name'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Please provide product description']
    },
    price: {
        type: Number,
        required: [true, 'Please provide product price'],
        min: 0
    },
    size: {
        type: String,
        required: [true, 'Please provide product size'],
        enum: ['50ml', '100ml', '200ml', '500ml', '1l', '2l', '5l']
    },
    category: {
        type: String,
        default: 'Premium Cow Ghee'
    },
    stock: {
        type: Number,
        required: [true, 'Please provide stock quantity'],
        min: 0,
        default: 100
    },
    image: {
        type: String,
        default: 'images/ghee_default.png'
    },
    rating: {
        type: Number,
        default: 4.5,
        min: 0,
        max: 5
    },
    numReviews: {
        type: Number,
        default: 0
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Product', productSchema);
