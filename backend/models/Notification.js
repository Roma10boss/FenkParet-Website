const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: { // Can be 'admin', 'user', or a specific user ID
    type: String,
    required: true,
    index: true,
  },
  recipientId: { // Optional: if recipient is a specific user
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    index: true,
    default: null,
  },
  type: {
    type: String,
    enum: ['new-order', 'new-user', 'low-stock', 'ticket-update', 'system-alert', 'promotional'],
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  link: { // Optional URL for the notification to navigate to
    type: String,
  },
  isRead: {
    type: Boolean,
    default: false,
  },
  readAt: {
    type: Date,
  },
  metadata: { // Store additional context about the notification
    type: mongoose.Schema.Types.Mixed,
  },
  emittedViaSocket: { // Track if it was sent via socket.io
    type: Boolean,
    default: false,
  }
}, {
  timestamps: true, // createdAt, updatedAt
});

module.exports = mongoose.model('Notification', notificationSchema);