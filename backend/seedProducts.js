const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const Product = require('./models/Product');

// Load environment variables from backend/.env
dotenv.config({ path: path.join(__dirname, '.env') });

const products = [
    {
        name: "Premium Cow Ghee - 50ml",
        price: 40,
        size: "50ml",
        description: "Pure cow ghee made from organic milk",
        rating: 4.5,
        image: "images/ghee_50ml.png",
        stock: 150
    },
    {
        name: "Premium Cow Ghee - 100ml",
        price: 80,
        size: "100ml",
        description: "Pure cow ghee made from organic milk",
        rating: 4.6,
        image: "images/ghee_100ml.png",
        stock: 120
    },
    {
        name: "Premium Cow Ghee - 200ml",
        price: 150,
        size: "200ml",
        description: "Pure cow ghee made from organic milk",
        rating: 4.5,
        image: "images/ghee_200ml.png",
        stock: 100
    },
    {
        name: "Premium Cow Ghee - 500ml",
        price: 375,
        size: "500ml",
        description: "Pure cow ghee made from organic milk",
        rating: 4.7,
        image: "images/ghee_500ml.png",
        stock: 80
    },
    {
        name: "Premium Cow Ghee - 1L",
        price: 750,
        size: "1l",
        description: "Pure cow ghee made from organic milk",
        rating: 4.8,
        image: "images/ghee_1l.png",
        stock: 60
    },
    {
        name: "Premium Cow Ghee - 2L",
        price: 1500,
        size: "2l",
        description: "Pure cow ghee made from organic milk",
        rating: 4.9,
        image: "images/ghee_2l.png",
        stock: 30
    },
    {
        name: "Premium Cow Ghee - 5L",
        price: 3750,
        size: "5l",
        description: "Pure cow ghee made from organic milk",
        rating: 4.9,
        image: "images/ghee_2l.png",
        stock: 15
    }
];

const seedProducts = async () => {
    try {
        const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/nk-dairy-products';
        console.log(`Connecting to MongoDB at: ${MONGODB_URI}`);
        
        await mongoose.connect(MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        console.log('✅ Connected to MongoDB');

        // Delete existing products
        await Product.deleteMany({});
        console.log('🗑️ Deleted existing products');

        // Insert seed products
        const createdProducts = await Product.insertMany(products);
        console.log(`🌱 Successfully seeded ${createdProducts.length} products`);

        mongoose.connection.close();
        console.log('🔌 Connection closed');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding products:', error);
        process.exit(1);
    }
};

seedProducts();
