#!/usr/bin/env node
// scripts/test-auth.js
const mongoose = require('mongoose');
require('dotenv').config();

// Import User model
const User = require('../models/User');

async function testAuthentication() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/fenkparet';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    console.log('\n🧪 Testing Authentication System...\n');

    // Test 1: Check admin user
    console.log('📋 Test 1: Checking Admin User');
    const adminUser = await User.findOne({ 
      $or: [
        { isAdmin: true },
        { role: 'admin' }
      ]
    });

    if (adminUser) {
      console.log('✅ Admin user found:');
      console.log('   📧 Email:', adminUser.email);
      console.log('   👑 isAdmin:', adminUser.isAdmin);
      console.log('   🎭 Role:', adminUser.role);
      console.log('   ✅ Active:', adminUser.isActive);
    } else {
      console.log('❌ No admin user found! Run: npm run create-admin');
    }

    // Test 2: Check regular user
    console.log('\n📋 Test 2: Checking Regular User');
    const regularUser = await User.findOne({ 
      $and: [
        { isAdmin: { $ne: true } },
        { role: { $ne: 'admin' } }
      ]
    });

    if (regularUser) {
      console.log('✅ Regular user found:');
      console.log('   📧 Email:', regularUser.email);
      console.log('   👤 isAdmin:', regularUser.isAdmin);
      console.log('   🎭 Role:', regularUser.role);
      console.log('   ✅ Active:', regularUser.isActive);
    } else {
      console.log('❌ No regular user found! Run: npm run create-admin');
    }

    // Test 3: Test password hashing
    console.log('\n📋 Test 3: Testing Password Hashing');
    if (adminUser) {
      const testPassword = 'Admin123!';
      const isValid = await adminUser.comparePassword(testPassword);
      console.log('✅ Password comparison test:', isValid ? 'PASSED' : 'FAILED');
      if (!isValid) {
        console.log('   ⚠️  Default password might have been changed');
      }
    }

    // Test 4: Count users by role
    console.log('\n📋 Test 4: User Statistics');
    const totalUsers = await User.countDocuments();
    const adminUsers = await User.countDocuments({ 
      $or: [{ isAdmin: true }, { role: 'admin' }] 
    });
    const regularUsers = await User.countDocuments({ 
      $and: [
        { isAdmin: { $ne: true } },
        { role: { $ne: 'admin' } }
      ]
    });
    const activeUsers = await User.countDocuments({ isActive: true });

    console.log('   👥 Total Users:', totalUsers);
    console.log('   👑 Admin Users:', adminUsers);
    console.log('   👤 Regular Users:', regularUsers);
    console.log('   ✅ Active Users:', activeUsers);

    // Test 5: Validate user schema
    console.log('\n📋 Test 5: Schema Validation');
    if (adminUser) {
      const userObject = adminUser.toJSON();
      const hasRequiredFields = userObject.email && userObject.name;
      const hasRoleFields = (userObject.isAdmin !== undefined) && userObject.role;
      const passwordHidden = !userObject.password;

      console.log('   ✅ Required fields present:', hasRequiredFields);
      console.log('   ✅ Role fields present:', hasRoleFields);
      console.log('   ✅ Password hidden in JSON:', passwordHidden);
    }

    console.log('\n🎉 Authentication system test completed!');

    // Recommendations
    console.log('\n💡 Recommendations:');
    if (adminUsers === 0) {
      console.log('   🔧 Run: npm run create-admin (to create admin user)');
    }
    if (regularUsers === 0) {
      console.log('   🔧 Create test regular user through registration');
    }
    console.log('   🔐 Change default passwords after testing');
    console.log('   🔒 Test login endpoints with both user types');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n📡 Disconnected from MongoDB');
  }
}

// API Test function
async function testAPIEndpoints() {
  console.log('\n🌐 API Endpoint Tests:');
  console.log('   Test these endpoints manually:');
  console.log('');
  console.log('   👤 Regular User Login:');
  console.log('   POST http://localhost:5000/api/auth/login');
  console.log('   Body: { "email": "user@test.com", "password": "TestUser123!" }');
  console.log('');
  console.log('   👑 Admin User Login:');
  console.log('   POST http://localhost:5000/api/auth/login');
  console.log('   Body: { "email": "admin@fenkparet.com", "password": "Admin123!" }');
  console.log('');
  console.log('   🔐 Get Current User:');
  console.log('   GET http://localhost:5000/api/auth/me');
  console.log('   Header: Authorization: Bearer <token>');
  console.log('');
  console.log('   👑 Admin Dashboard:');
  console.log('   GET http://localhost:5000/api/admin/dashboard');
  console.log('   Header: Authorization: Bearer <admin-token>');
}

async function main() {
  await testAuthentication();
  testAPIEndpoints();
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = { testAuthentication };