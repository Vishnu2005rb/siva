const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

// Import models
const User = require('./models/User');
const Product = require('./models/Product');
const Order = require('./models/Order');

// Load environment variables from backend/.env
dotenv.config({ path: path.join(__dirname, '.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/nk-dairy-products';

// Static products fallback
const staticProducts = [
  { id: 1, name: "Premium Cow Ghee - 50ml", price: 40, size: "50ml", description: "Pure cow ghee made from organic milk", rating: 4.5, stock: 150 },
  { id: 2, name: "Premium Cow Ghee - 100ml", price: 80, size: "100ml", description: "Pure cow ghee made from organic milk", rating: 4.6, stock: 120 },
  { id: 3, name: "Premium Cow Ghee - 200ml", price: 150, size: "200ml", description: "Pure cow ghee made from organic milk", rating: 4.5, stock: 100 },
  { id: 4, name: "Premium Cow Ghee - 500ml", price: 375, size: "500ml", description: "Pure cow ghee made from organic milk", rating: 4.7, stock: 80 },
  { id: 5, name: "Premium Cow Ghee - 1L", price: 750, size: "1l", description: "Pure cow ghee made from organic milk", rating: 4.8, stock: 60 },
  { id: 6, name: "Premium Cow Ghee - 2L", price: 1500, size: "2l", description: "Pure cow ghee made from organic milk", rating: 4.9, stock: 30 },
  { id: 7, name: "Premium Cow Ghee - 5L", price: 3750, size: "5l", description: "Pure cow ghee made from organic milk", rating: 4.9, stock: 15 }
];

// Helper to format tables
function generateProductsTable(productsList) {
    let md = `| Name | Size | Price | Stock | Rating | Status |\n`;
    md += `| :--- | :--- | :--- | :--- | :--- | :--- |\n`;
    productsList.forEach(p => {
        const stockQty = p.stock !== undefined ? p.stock : '100 (Default)';
        md += `| ${p.name} | ${p.size} | ₹${p.price} | ${stockQty} | ${p.rating}⭐ | ${p.isActive !== false ? '✅ Active' : '❌ Inactive'} |\n`;
    });
    return md;
}

async function main() {
    try {
        console.log(`Connecting to MongoDB at: ${MONGODB_URI}...`);
        await mongoose.connect(MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000 // 5 seconds timeout
        });
        console.log('✅ Connected to MongoDB successfully.');

        // Fetch Users
        const users = await User.find({}).lean();
        // Fetch Products
        const products = await Product.find({}).lean();
        // Fetch Orders
        const orders = await Order.find({}).populate('user', 'fullname email').lean();

        // Generate Markdown with live data
        let markdown = `# 📊 Database Data Export (Live MongoDB Data)\n\n`;
        markdown += `*Last fetched: ${new Date().toLocaleString()}*\n\n`;

        // 1. Users Table
        markdown += `## 👥 Users (${users.length})\n\n`;
        if (users.length === 0) {
            markdown += `*No users found in the database.*\n\n`;
        } else {
            markdown += `| Name | Email | Phone | Role | Created At |\n`;
            markdown += `| :--- | :--- | :--- | :--- | :--- |\n`;
            users.forEach(u => {
                const createdAt = u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A';
                markdown += `| ${u.fullname || 'N/A'} | ${u.email || 'N/A'} | ${u.phone || 'N/A'} | ${u.role || 'user'} | ${createdAt} |\n`;
            });
            markdown += `\n`;
        }

        // 2. Products Table
        markdown += `## 📦 Products (${products.length})\n\n`;
        if (products.length === 0) {
            markdown += `*No products in database. Showing Static Config Fallback:*\n\n`;
            markdown += generateProductsTable(staticProducts);
        } else {
            markdown += generateProductsTable(products);
        }
        markdown += `\n`;

        // 3. Orders Table
        markdown += `## 🛒 Orders (${orders.length})\n\n`;
        if (orders.length === 0) {
            markdown += `*No orders found in the database.*\n\n`;
        } else {
            markdown += `| Order ID | Customer | Items | Total Amount | Payment Method | Payment Status | Order Status | Date |\n`;
            markdown += `| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |\n`;
            orders.forEach(o => {
                const customerName = o.user ? o.user.fullname : 'Guest';
                const itemsSummary = o.items.map(item => `${item.name} (${item.size}) x${item.quantity}`).join('<br>');
                const orderDate = o.createdAt ? new Date(o.createdAt).toLocaleDateString() : 'N/A';
                markdown += `| ${o.orderId} | ${customerName} | ${itemsSummary} | ₹${o.totalAmount} | ${o.paymentMethod.toUpperCase()} | ${o.paymentStatus} | ${o.orderStatus} | ${orderDate} |\n`;
            });
            markdown += `\n`;
        }

        const targetPath = path.join(__dirname, '..', 'DATABASE_DATA.md');
        fs.writeFileSync(targetPath, markdown);
        console.log(`✅ Live database markdown file written to: ${targetPath}`);

        mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.warn('⚠️ MongoDB connection failed. Creating mockup/fallback tables in the markdown file.');
        
        let fallbackMarkdown = `# 📊 Database Data Export (Offline Preview)\n\n`;
        fallbackMarkdown += `> ⚠️ **Notice**: The script could not connect to your local MongoDB server (\`${MONGODB_URI}\`). Showing project's product catalog and schema templates.\n\n`;
        fallbackMarkdown += `*Generated: ${new Date().toLocaleString()}*\n\n`;
        
        // 1. Products Table (Using static array)
        fallbackMarkdown += `## 📦 Product Catalog (Static Project Config)\n\n`;
        fallbackMarkdown += generateProductsTable(staticProducts);
        fallbackMarkdown += `\n`;

        // 2. Demo User Table (Template)
        fallbackMarkdown += `## 👥 Demo Users (Template Schema)\n\n`;
        fallbackMarkdown += `| Name | Email | Phone | Role | Status |\n`;
        fallbackMarkdown += `| :--- | :--- | :--- | :--- | :--- |\n`;
        fallbackMarkdown += `| Admin User | admin@nkgroups.com | +91 9876543210 | admin | 👤 Active |\n`;
        fallbackMarkdown += `| Test Customer | user@nkgroups.com | +91 9999999999 | user | 👤 Active |\n`;
        fallbackMarkdown += `\n`;

        // 3. Demo Orders Table (Template)
        fallbackMarkdown += `## 🛒 Demo Orders (Template Schema)\n\n`;
        fallbackMarkdown += `| Order ID | Customer | Items | Total Amount | Payment Method | Payment Status | Order Status |\n`;
        fallbackMarkdown += `| :--- | :--- | :--- | :--- | :--- | :--- | :--- |\n`;
        fallbackMarkdown += `| NK-87421 | Test Customer | Premium Cow Ghee - 1L (1l) x1 | ₹750.00 | COD | pending | pending |\n`;
        fallbackMarkdown += `| NK-32104 | Admin User | Premium Cow Ghee - 500ml (500ml) x2 | ₹750.00 | CARD | completed | processing |\n`;
        fallbackMarkdown += `\n`;

        const targetPath = path.join(__dirname, '..', 'DATABASE_DATA.md');
        fs.writeFileSync(targetPath, fallbackMarkdown);
        console.log(`✅ Fallback database markdown file written to: ${targetPath}`);
        
        process.exit(0);
    }
}

main();
