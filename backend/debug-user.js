// backend/debug-user.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const debugUser = async () => {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce';
    console.log('🔌 Connecting to:', mongoUri);
    
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Get all collections to see what exists
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('\n📁 Available collections:');
    collections.forEach(col => console.log(`   - ${col.name}`));

    // Try to find the user with raw MongoDB query
    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');
    
    console.log('\n🔍 Searching for admin user...');
    const adminUser = await usersCollection.findOne({ email: 'admin@fenkparet.com' });
    
    if (adminUser) {
      console.log('\n✅ Found admin user:');
      console.log('📧 Email:', adminUser.email);
      console.log('👤 Name:', adminUser.name);
      console.log('🛡️  isAdmin:', adminUser.isAdmin);
      console.log('🔑 Role:', adminUser.role);
      console.log('✅ Active:', adminUser.isActive);
      console.log('📅 Created:', adminUser.createdAt);
      console.log('🔐 Password Hash:', adminUser.password ? 'Present' : 'Missing');
      console.log('🔍 Password Sample:', adminUser.password ? adminUser.password.substring(0, 20) + '...' : 'N/A');
      
      // Test password
      console.log('\n🧪 Testing password "admin123"...');
      const isMatch = await bcrypt.compare('admin123', adminUser.password);
      console.log('🔐 Password Match:', isMatch ? '✅ YES' : '❌ NO');
      
      // If password doesn't match, let's rehash it
      if (!isMatch) {
        console.log('\n🔄 Password doesn\'t match, creating new hash...');
        const newHash = await bcrypt.hash('admin123', 12);
        console.log('📝 New hash created, updating user...');
        
        await usersCollection.updateOne(
          { email: 'admin@fenkparet.com' },
          { 
            $set: { 
              password: newHash,
              isAdmin: true,
              isActive: true,
              updatedAt: new Date()
            }
          }
        );
        
        console.log('✅ User updated with new password hash');
        
        // Test again
        const testAgain = await bcrypt.compare('admin123', newHash);
        console.log('🧪 Testing new hash:', testAgain ? '✅ WORKS' : '❌ STILL BROKEN');
      }
      
    } else {
      console.log('\n❌ No admin user found!');
      
      // Create new one
      console.log('📝 Creating new admin user...');
      const hashedPassword = await bcrypt.hash('admin123', 12);
      
      const newAdmin = {
        name: 'Admin User',
        email: 'admin@fenkparet.com',
        password: hashedPassword,
        phone: '+509-1234-5678',
        isAdmin: true,
        isActive: true,
        emailVerified: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      await usersCollection.insertOne(newAdmin);
      console.log('✅ New admin user created');
    }
    
    // Final verification
    console.log('\n🔍 Final verification...');
    const verifyUser = await usersCollection.findOne({ email: 'admin@fenkparet.com' });
    if (verifyUser) {
      console.log('✅ Admin user exists');
      console.log('🛡️  Admin status:', verifyUser.isAdmin);
      console.log('✅ Active status:', verifyUser.isActive);
      
      const finalTest = await bcrypt.compare('admin123', verifyUser.password);
      console.log('🔐 Password works:', finalTest ? '✅ YES' : '❌ NO');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
    process.exit(0);
  }
};

debugUser();