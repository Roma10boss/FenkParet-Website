const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema({
  siteName: {
    type: String,
    default: 'Fenkparet',
  },
  currency: {
    type: String,
    default: 'USD',
    enum: ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD'], // Add more as needed
  },
  shippingRate: {
    type: Number,
    default: 0.00,
    min: 0,
  },
  taxRate: {
    type: Number,
    default: 0.00,
    min: 0,
    max: 1, // Store as decimal, e.g., 0.08 for 8%
  },
  freeShippingThreshold: {
    type: Number,
    default: 0.00,
    min: 0,
  },
  contactEmail: {
    type: String,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address.'],
  },
  contactPhone: {
    type: String,
    trim: true,
  },
  // Add other settings like social media links, payment gateway configs, etc.
  socialMedia: {
    facebook: String,
    twitter: String,
    instagram: String,
    linkedin: String,
  },
  maintenanceMode: {
    type: Boolean,
    default: false,
  },
  lastUpdatedBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
  }
}, {
  timestamps: true,
});

module.exports = mongoose.model('Setting', settingSchema);