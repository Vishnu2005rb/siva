const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const User = require('./models/User');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

const updateAdminEmail = async () => {
    try {
        const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/nk-dairy-products';
        console.log(`Connecting to MongoDB at: ${mongoUri}`);

        await mongoose.connect(mongoUri, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        console.log('✅ Connected to MongoDB');

        const oldEmail = 'vishnu18062005@gmail.com';
        const newEmail = 'nk.dairyproduct@gmail.com';

        // Check if the new admin user already exists
        let newAdmin = await User.findOne({ email: newEmail });
        let oldAdmin = await User.findOne({ email: oldEmail });

        if (newAdmin) {
            console.log(`ℹ️ User ${newEmail} already exists. Setting role to 'admin'...`);
            newAdmin.role = 'admin';
            newAdmin.fullname = 'NK Dairy Admin';
            await newAdmin.save();
            console.log(`✅ Set role of ${newEmail} to 'admin'`);

            if (oldAdmin) {
                console.log(`ℹ️ Setting role of ${oldEmail} to 'user'...`);
                oldAdmin.role = 'user';
                await oldAdmin.save();
                console.log(`✅ Demoted ${oldEmail} to 'user'`);
            }
        } else {
            if (oldAdmin) {
                console.log(`ℹ️ Renaming user ${oldEmail} to ${newEmail} and ensuring admin role...`);
                oldAdmin.email = newEmail;
                oldAdmin.fullname = 'NK Dairy Admin';
                oldAdmin.role = 'admin';
                await oldAdmin.save();
                console.log(`✅ Renamed old admin user to ${newEmail}`);
            } else {
                console.log(`ℹ️ Creating a new admin user: ${newEmail}...`);
                await User.create({
                    fullname: 'NK Dairy Admin',
                    email: newEmail,
                    phone: '+91 9876543210',
                    password: Math.random().toString(36).substring(2, 10),
                    role: 'admin'
                });
                console.log(`✅ Created new admin user: ${newEmail}`);
            }
        }

        mongoose.connection.close();
        console.log('🔌 Database connection closed');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error updating admin email:', error);
        process.exit(1);
    }
};

updateAdminEmail();
