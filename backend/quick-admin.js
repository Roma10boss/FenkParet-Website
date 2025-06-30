// backend/quick-admin.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Simple User schema if model doesn't exist
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String },
  isAdmin: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  emailVerified: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Try to use existing model or create new one
let User;
try {
  User = mongoose.model('User');
} catch (error) {
  User = mongoose.model('User', userSchema);
}

const createQuickAdmin = async () => {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/haitian-ecommerce';
    console.log('🔌 Connecting to:', mongoUri);
    
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Check if admin exists
    const existingAdmin = await User.findOne({ email: 'admin@fenkparet.com' });
    if (existingAdmin) {
      console.log('✅ Admin user already exists!');
      console.log('📧 Email: admin@fenkparet.com');
      console.log('🔑 Password: admin123');
      console.log('🛡️  Admin Status:', existingAdmin.isAdmin ? 'Yes' : 'No');
      
      // Update to make sure it's admin
      if (!existingAdmin.isAdmin) {
        await User.updateOne(
          { email: 'admin@fenkparet.com' }, 
          { isAdmin: true, isActive: true }
        );
        console.log('🔄 Updated user to admin status');
      }
      
      process.exit(0);
    }

    // Create new admin
    console.log('⏳ Creating admin user...');
    const hashedPassword = await bcrypt.hash('admin123', 12);
    
    const adminUser = new User({
      name: 'Admin User',
      email: 'admin@fenkparet.com',
      password: hashedPassword,
      phone: '+509-1234-5678',
      isAdmin: true,
      isActive: true,
      emailVerified: true
    });

    await adminUser.save();
    
    console.log('🎉 Admin user created successfully!');
    console.log('');
    console.log('📋 Login Details:');
    console.log('   Email: admin@fenkparet.com');
    console.log('   Password: admin123');
    console.log('   Admin: Yes');
    console.log('');
    console.log('🚀 Login URL: http://localhost:3000/admin/login');

  } catch (error) {
    console.error('❌ Error:', error.message);
    
    if (error.code === 11000) {
      console.log('🔍 User might already exist. Checking...');
      try {
        const user = await User.findOne({ email: 'admin@fenkparet.com' });
        if (user) {
          console.log('✅ Found existing user:', user.email);
          console.log('🛡️  Admin Status:', user.isAdmin ? 'Yes' : 'No');
        }
      } catch (findError) {
        console.error('Error finding user:', findError.message);
      }
    }
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  }
};

createQuickAdmin();