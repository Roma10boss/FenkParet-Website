const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  productSnapshot: {
    name: String,
    price: Number,
    image: String,
    sku: String
  },
  variant: {
    name: String,
    value: String,
    priceAdjustment: Number
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  unitPrice: {
    type: Number,
    required: true,
    min: 0
  },
  totalPrice: {
    type: Number,
    required: true,
    min: 0
  }
});

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    unique: true,
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    sparse: true // Allow null for guest orders
  },
  customer: {
    firstName: {
      type: String,
      required: true,
      trim: true
    },
    lastName: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
    },
    phone: {
      type: String,
      trim: true
    }
  },
  shippingAddress: {
    street: {
      type: String,
      required: true
    },
    city: {
      type: String,
      required: true
    },
    state: String,
    postalCode: String,
    country: {
      type: String,
      default: 'Haiti'
    },
    additionalInfo: String
  },
  billingAddress: {
    street: String,
    city: String,
    state: String,
    postalCode: String,
    country: String,
    sameAsShipping: {
      type: Boolean,
      default: true
    }
  },
  items: [orderItemSchema],
  pricing: {
    subtotal: {
      type: Number,
      required: true,
      min: 0
    },
    shipping: {
      type: Number,
      default: 0,
      min: 0
    },
    tax: {
      type: Number,
      default: 0,
      min: 0
    },
    discount: {
      type: Number,
      default: 0,
      min: 0
    },
    total: {
      type: Number,
      required: true,
      min: 0
    }
  },
  payment: {
    method: {
      type: String,
      enum: ['moncash', 'confirmation_number'],
      default: 'moncash'
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'failed', 'refunded', 'pending-confirmation'],
      default: 'pending'
    },
    confirmationNumber: {
      type: String,
      trim: true,
      // Required only if method is 'confirmation_number'
      required: function() { return this.method === 'confirmation_number'; }
    },
    moncash: {
      customerName: {
        type: String,
        trim: true
      },
      amount: {
        type: Number,
        min: 0
      },
      verifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      verifiedAt: Date,
      notes: String
    },
    paidAt: Date
  },
  status: {
    type: String,
    enum: ['pending', 'payment-pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'],
    default: 'payment-pending'
  },
  tracking: {
    number: String,
    carrier: String,
    url: String,
    estimatedDelivery: Date
  },
  timeline: [{
    status: {
      type: String,
      required: true
    },
    message: String,
    timestamp: {
      type: Date,
      default: Date.now
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  notes: {
    customer: String,
    internal: String
  },
  cancellation: {
    reason: String,
    cancelledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    cancelledAt: Date,
    refundIssued: {
      type: Boolean,
      default: false
    }
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expireAfterSeconds: 0 }
  },
  language: {
    type: String,
    enum: ['en', 'fr'],
    default: 'en'
  }
}, {
  timestamps: true
});

// Indexes for better performance
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ 'customer.email': 1 });
orderSchema.index({ status: 1, createdAt: -1 });
orderSchema.index({ 'payment.status': 1 });
orderSchema.index({ expiresAt: 1 });

// Generate order number before saving
orderSchema.pre('save', function(next) {
  if (!this.orderNumber) {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    this.orderNumber = `ORD-${timestamp}-${random}`.toUpperCase();
  }
  
  // Set expiration date (72 hours from creation) and initial timeline entry
  if (this.isNew && this.payment.method !== 'confirmation_number') {
    this.expiresAt = new Date(Date.now() + 72 * 60 * 60 * 1000); // 72 hours
    
    this.timeline.push({
      status: 'payment-pending',
      message: 'Order created, awaiting payment confirmation',
      timestamp: new Date()
    });
  } else if (this.isNew && this.payment.method === 'confirmation_number') {
    // For confirmation number orders, set a different initial status and no immediate expiration
    this.timeline.push({
      status: 'pending-confirmation',
      message: 'Order placed with confirmation number, awaiting admin verification',
      timestamp: new Date()
    });
    // Optionally set a longer expiration or no expiration for admin review
    this.expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000); // 48 hours for admin to verify
  }
  
  next();
});

// Virtual for customer full name
orderSchema.virtual('customerFullName').get(function() {
  return `${this.customer.firstName} ${this.customer.lastName}`;
});

// Virtual for order age in hours
orderSchema.virtual('ageInHours').get(function() {
  return Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60));
});

// Virtual for time remaining until expiration
orderSchema.virtual('timeUntilExpiration').get(function() {
  const now = new Date();
  const timeLeft = this.expiresAt - now;
  return timeLeft > 0 ? timeLeft : 0;
});

// Method to add timeline entry
orderSchema.methods.addTimelineEntry = function(status, message, updatedBy = null) {
  this.timeline.push({
    status,
    message,
    timestamp: new Date(),
    updatedBy
  });
  this.status = status;
};

// Method to confirm payment
orderSchema.methods.confirmPayment = function(verifiedBy, notes = '') {
  this.payment.status = 'confirmed';
  this.payment.verifiedBy = verifiedBy;
  this.payment.verifiedAt = new Date();
  this.payment.paidAt = new Date();
  
  if (this.payment.method === 'moncash') {
    this.payment.moncash.notes = notes;
  } else if (this.payment.method === 'confirmation_number') {
    this.payment.notes = notes; // Add notes directly to payment for confirmation_number method
  }
  
  this.addTimelineEntry('confirmed', 'Payment confirmed by admin', verifiedBy);
  
  // Remove expiration since payment is confirmed
  this.expiresAt = undefined;
};

// Method to cancel order
orderSchema.methods.cancelOrder = function(reason, cancelledBy = null) {
  this.status = 'cancelled';
  this.cancellation = {
    reason,
    cancelledBy,
    cancelledAt: new Date()
  };
  
  this.addTimelineEntry('cancelled', `Order cancelled: ${reason}`, cancelledBy);
};

// Static method to get sales analytics
orderSchema.statics.getSalesAnalytics = async function(dateRange) {
  const { startDate, endDate } = dateRange;
  
  const pipeline = [
    {
      $match: {
        status: { $in: ['confirmed', 'processing', 'shipped', 'delivered'] },
        createdAt: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: null,
        totalOrders: { $sum: 1 },
        totalRevenue: { $sum: '$pricing.total' },
        averageOrderValue: { $avg: '$pricing.total' }
      }
    }
  ];
  
  const result = await this.aggregate(pipeline);
  return result[0] || { totalOrders: 0, totalRevenue: 0, averageOrderValue: 0 };
};

module.exports = mongoose.model('Order', orderSchema);