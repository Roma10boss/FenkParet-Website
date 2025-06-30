#!/usr/bin/env node
// scripts/create-admin.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import User model
const User = require('../models/User');

async function createAdminUser() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/fenkparet';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Admin user details
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@fenkparet.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin123!';
    const adminName = process.env.ADMIN_NAME || 'Admin User';

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: adminEmail });
    if (existingAdmin) {
      console.log('⚠️  Admin user already exists with email:', adminEmail);
      
      // Update to ensure admin privileges
      existingAdmin.isAdmin = true;
      existingAdmin.role = 'admin';
      existingAdmin.isActive = true;
      await existingAdmin.save();
      
      console.log('✅ Updated existing user to have admin privileges');
      process.exit(0);
    }

    // Create admin user
    const adminUser = new User({
      name: adminName,
      email: adminEmail,
      password: adminPassword, // Will be hashed by pre-save middleware
      isAdmin: true,
      role: 'admin',
      isActive: true,
      emailVerified: true,
      phone: '+1-555-0123'
    });

    await adminUser.save();

    console.log('🎉 Admin user created successfully!');
    console.log('📧 Email:', adminEmail);
    console.log('🔐 Password:', adminPassword);
    console.log('👑 Role: admin');
    console.log('✅ Active: true');
    console.log('');
    console.log('🔗 You can now login at:');
    console.log('   Frontend: http://localhost:3000/admin/login');
    console.log('   Backend API: POST /api/auth/login');
    console.log('');
    console.log('⚠️  Please change the default password after first login!');

  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  } finally {
    await mongoose.disconnect();
    console.log('📡 Disconnected from MongoDB');
  }
}

// Also create a regular test user
async function createTestUser() {
  try {
    const testEmail = 'user@test.com';
    const testPassword = 'TestUser123!';
    const testName = 'Test User';

    // Check if test user already exists
    const existingUser = await User.findOne({ email: testEmail });
    if (existingUser) {
      console.log('⚠️  Test user already exists with email:', testEmail);
      return;
    }

    // Create test user
    const testUser = new User({
      name: testName,
      email: testEmail,
      password: testPassword, // Will be hashed by pre-save middleware
      isAdmin: false,
      role: 'user',
      isActive: true,
      emailVerified: true,
      phone: '+1-555-0456'
    });

    await testUser.save();

    console.log('');
    console.log('👤 Test user created successfully!');
    console.log('📧 Email:', testEmail);
    console.log('🔐 Password:', testPassword);
    console.log('👤 Role: user');
    console.log('✅ Active: true');

  } catch (error) {
    console.error('❌ Error creating test user:', error);
  }
}

async function main() {
  console.log('🚀 Setting up admin and test users...');
  console.log('');
  
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/fenkparet';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    await createAdminUser();
    await createTestUser();

  } catch (error) {
    console.error('❌ Setup failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('📡 Disconnected from MongoDB');
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = { createAdminUser, createTestUser };