const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const Order = require('./models/Order');
const User = require('./models/User');
const Product = require('./models/Product');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

const clearAndSeedSingleOrder = async () => {
    try {
        const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/nk-dairy-products';
        console.log(`Connecting to MongoDB at: ${mongoUri}`);

        await mongoose.connect(mongoUri, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        console.log('✅ Connected to MongoDB');

        // Delete all existing orders
        const deleteRes = await Order.deleteMany({});
        console.log(`🗑️ Deleted ${deleteRes.deletedCount} existing orders`);

        // Find a reference user (prefer admin, fallback to any user)
        let refUser = await User.findOne({ role: 'admin' });
        if (!refUser) {
            refUser = await User.findOne({});
        }

        if (!refUser) {
            console.error('❌ No user found in the database. Please register a user first.');
            mongoose.connection.close();
            process.exit(1);
        }
        console.log(`👤 Using reference user: ${refUser.fullname} (${refUser.email})`);

        // Find a reference product
        const refProduct = await Product.findOne({});
        if (!refProduct) {
            console.error('❌ No products found in the database. Please run npm run seed first.');
            mongoose.connection.close();
            process.exit(1);
        }
        console.log(`📦 Using reference product: ${refProduct.name}`);

        // Create exactly one reference order
        const refOrder = new Order({
            orderId: 'NK-87421',
            user: refUser._id,
            items: [{
                product: refProduct._id,
                name: refProduct.name,
                price: refProduct.price,
                quantity: 1,
                size: refProduct.size || '500ml'
            }],
            shippingAddress: {
                firstName: 'Test',
                lastName: 'Customer',
                email: 'user@nkgroups.com',
                phone: '+91 9999999999',
                address: '123 Ghee Bazaar Road, Anna Nagar',
                city: 'Madurai',
                state: 'Tamil Nadu',
                pincode: '625020',
                country: 'India'
            },
            paymentMethod: 'cod',
            paymentStatus: 'pending',
            subtotal: refProduct.price,
            deliveryCharges: 0,
            tax: 0,
            totalAmount: refProduct.price,
            orderStatus: 'pending'
        });

        const savedOrder = await refOrder.save();
        console.log(`🌱 Created reference order: ${savedOrder.orderId}`);

        mongoose.connection.close();
        console.log('🔌 Database connection closed');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error updating database orders:', error);
        process.exit(1);
    }
};

clearAndSeedSingleOrder();
