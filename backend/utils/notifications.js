// utils/notifications.js
const Notification = require('../models/Notification');

// Create notification
const createNotification = async (data) => {
  try {
    const notification = new Notification(data);
    await notification.save();
    
    console.log(`=â Notification created: ${notification.title}`);
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

// Get notifications for user
const getUserNotifications = async (userId, limit = 10, page = 1) => {
  try {
    const skip = (page - 1) * limit;
    
    const notifications = await Notification.find({ 
      recipient: userId 
    })
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip)
    .populate('relatedOrder', 'orderNumber status')
    .populate('relatedProduct', 'name price');
    
    const total = await Notification.countDocuments({ recipient: userId });
    const unreadCount = await Notification.countDocuments({ 
      recipient: userId, 
      read: false 
    });
    
    return {
      notifications,
      total,
      unreadCount,
      currentPage: page,
      totalPages: Math.ceil(total / limit)
    };
  } catch (error) {
    console.error('Error getting user notifications:', error);
    throw error;
  }
};

// Mark notification as read
const markAsRead = async (notificationId, userId) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, recipient: userId },
      { read: true, readAt: new Date() },
      { new: true }
    );
    
    if (!notification) {
      throw new Error('Notification not found or access denied');
    }
    
    return notification;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
};

// Mark all notifications as read
const markAllAsRead = async (userId) => {
  try {
    const result = await Notification.updateMany(
      { recipient: userId, read: false },
      { read: true, readAt: new Date() }
    );
    
    console.log(`=â Marked ${result.modifiedCount} notifications as read for user ${userId}`);
    return result;
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    throw error;
  }
};

// Delete notification
const deleteNotification = async (notificationId, userId) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: notificationId,
      recipient: userId
    });
    
    if (!notification) {
      throw new Error('Notification not found or access denied');
    }
    
    return notification;
  } catch (error) {
    console.error('Error deleting notification:', error);
    throw error;
  }
};

// Clean old notifications (older than 30 days)
const cleanOldNotifications = async () => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const result = await Notification.deleteMany({
      createdAt: { $lt: thirtyDaysAgo },
      read: true
    });
    
    console.log(`>ù Cleaned ${result.deletedCount} old notifications`);
    return result.deletedCount;
  } catch (error) {
    console.error('Error cleaning old notifications:', error);
    throw error;
  }
};

// Notification templates
const notificationTemplates = {
  orderConfirmed: (orderNumber) => ({
    title: 'Order Confirmed',
    message: `Your order ${orderNumber} has been confirmed and is being processed.`,
    type: 'order',
    priority: 'medium'
  }),
  
  orderShipped: (orderNumber, trackingNumber) => ({
    title: 'Order Shipped',
    message: `Your order ${orderNumber} has been shipped${trackingNumber ? ` with tracking number: ${trackingNumber}` : ''}.`,
    type: 'order',
    priority: 'high'
  }),
  
  orderDelivered: (orderNumber) => ({
    title: 'Order Delivered',
    message: `Your order ${orderNumber} has been delivered successfully.`,
    type: 'order',
    priority: 'high'
  }),
  
  orderCancelled: (orderNumber, reason) => ({
    title: 'Order Cancelled',
    message: `Your order ${orderNumber} has been cancelled${reason ? `: ${reason}` : ''}.`,
    type: 'order',
    priority: 'high'
  }),
  
  ticketResponse: (ticketId) => ({
    title: 'Support Ticket Update',
    message: `Your support ticket #${ticketId} has received a new response.`,
    type: 'support',
    priority: 'medium'
  }),
  
  productRestock: (productName) => ({
    title: 'Product Back in Stock',
    message: `${productName} is now back in stock!`,
    type: 'product',
    priority: 'low'
  })
};

module.exports = {
  createNotification,
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  cleanOldNotifications,
  notificationTemplates
};