const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  senderType: {
    type: String,
    enum: ['customer', 'admin'],
    required: true
  },
  message: {
    type: String,
    required: true,
    maxLength: 2000
  },
  attachments: [{
    filename: String,
    originalName: String,
    mimetype: String,
    size: Number,
    url: String
  }],
  isInternal: {
    type: Boolean,
    default: false
  },
  readBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    readAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

const ticketSchema = new mongoose.Schema({
  ticketNumber: {
    type: String,
    unique: true,
    required: true
  },
  subject: {
    type: String,
    required: true,
    trim: true,
    maxLength: 200
  },
  category: {
    type: String,
    enum: [
      'general-inquiry',
      'order-issue',
      'product-question',
      'shipping-issue',
      'payment-issue',
      'return-refund',
      'technical-support',
      'complaint',
      'suggestion',
      'other'
    ],
    default: 'general-inquiry'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['open', 'in-progress', 'waiting-customer', 'waiting-admin', 'resolved', 'closed'],
    default: 'open'
  },
  customer: {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      sparse: true
    },
    name: {
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
    phone: String
  },
  relatedOrder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  },
  relatedProduct: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  messages: [messageSchema],
  tags: [String],
  customFields: {
    type: Map,
    of: String
  },
  resolution: {
    summary: String,
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    resolvedAt: Date,
    satisfactionRating: {
      type: Number,
      min: 1,
      max: 5
    },
    feedback: String
  },
  lastActivityAt: {
    type: Date,
    default: Date.now
  },
  lastMessageBy: {
    type: String,
    enum: ['customer', 'admin']
  },
  dueDate: Date,
  escalatedAt: Date,
  closedAt: Date,
  language: {
    type: String,
    enum: ['en', 'fr'],
    default: 'en'
  }
}, {
  timestamps: true
});

// Indexes for better performance
ticketSchema.index({ ticketNumber: 1 });
ticketSchema.index({ 'customer.email': 1 });
ticketSchema.index({ 'customer.user': 1 });
ticketSchema.index({ status: 1, priority: 1 });
ticketSchema.index({ assignedTo: 1, status: 1 });
ticketSchema.index({ category: 1, status: 1 });
ticketSchema.index({ lastActivityAt: -1 });
ticketSchema.index({ createdAt: -1 });

// Generate ticket number before saving
ticketSchema.pre('save', function(next) {
  if (!this.ticketNumber) {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 4);
    this.ticketNumber = `TKT-${timestamp}-${random}`.toUpperCase();
  }
  next();
});

// Update lastActivityAt when messages are added
ticketSchema.pre('save', function(next) {
  if (this.isModified('messages') && this.messages.length > 0) {
    this.lastActivityAt = new Date();
    const lastMessage = this.messages[this.messages.length - 1];
    this.lastMessageBy = lastMessage.senderType;
    
    // Auto-update status based on who sent the last message
    if (this.status === 'waiting-customer' && lastMessage.senderType === 'customer') {
      this.status = 'open';
    } else if (this.status === 'waiting-admin' && lastMessage.senderType === 'admin') {
      this.status = 'in-progress';
    }
  }
  next();
});

// Virtual for response time
ticketSchema.virtual('responseTime').get(function() {
  if (this.messages.length >= 2) {
    const firstMessage = this.messages[0];
    const firstResponse = this.messages.find(msg => msg.senderType !== firstMessage.senderType);
    
    if (firstResponse) {
      return firstResponse.createdAt - firstMessage.createdAt;
    }
  }
  return null;
});

// Virtual for unread messages count
ticketSchema.virtual('unreadCount').get(function() {
  return this.messages.filter(msg => 
    msg.readBy.length === 0 || 
    !msg.readBy.some(read => read.user.toString() === this.customer.user?.toString())
  ).length;
});

// Method to add message
ticketSchema.methods.addMessage = function(senderId, senderType, message, attachments = [], isInternal = false) {
  const newMessage = {
    sender: senderId,
    senderType,
    message,
    attachments,
    isInternal
  };
  
  this.messages.push(newMessage);
  this.lastActivityAt = new Date();
  this.lastMessageBy = senderType;
  
  return newMessage;
};

// Method to close ticket
ticketSchema.methods.closeTicket = function(summary, resolvedBy) {
  this.status = 'closed';
  this.closedAt = new Date();
  this.resolution = {
    summary,
    resolvedBy,
    resolvedAt: new Date()
  };
};

// Method to escalate ticket
ticketSchema.methods.escalate = function() {
  this.priority = this.priority === 'urgent' ? 'urgent' : 
                  this.priority === 'high' ? 'urgent' : 
                  this.priority === 'medium' ? 'high' : 'medium';
  this.escalatedAt = new Date();
};

// Static method to get ticket statistics
ticketSchema.statics.getStatistics = async function(dateRange) {
  const { startDate, endDate } = dateRange;
  
  const pipeline = [
    {
      $match: {
        createdAt: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ];
  
  const statusCounts = await this.aggregate(pipeline);
  
  const avgResponseTime = await this.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate, $lte: endDate },
        'messages.1': { $exists: true }
      }
    },
    {
      $addFields: {
        responseTime: {
          $subtract: [
            { $arrayElemAt: ['$messages.createdAt', 1] },
            { $arrayElemAt: ['$messages.createdAt', 0] }
          ]
        }
      }
    },
    {
      $group: {
        _id: null,
        avgResponseTime: { $avg: '$responseTime' }
      }
    }
  ]);
  
  return {
    statusCounts,
    avgResponseTime: avgResponseTime[0]?.avgResponseTime || 0
  };
};

module.exports = mongoose.model('Ticket', ticketSchema);