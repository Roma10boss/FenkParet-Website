// utils/orderUtils.js
const Order = require('../models/Order');
const { notifyOrderUpdate } = require('./socket');

// Generate unique order number
const generateOrderNumber = () => {
  const timestamp = Date.now().toString();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `ORD-${timestamp.slice(-6)}${random}`;
};

// Calculate order total
const calculateOrderTotal = (items, shippingCost = 0, taxRate = 0) => {
  const subtotal = items.reduce((total, item) => {
    return total + (item.price * item.quantity);
  }, 0);
  
  const tax = subtotal * taxRate;
  const total = subtotal + shippingCost + tax;
  
  return {
    subtotal: parseFloat(subtotal.toFixed(2)),
    shippingCost: parseFloat(shippingCost.toFixed(2)),
    tax: parseFloat(tax.toFixed(2)),
    total: parseFloat(total.toFixed(2))
  };
};

// Cancel expired orders (for cron job)
const cancelExpiredOrders = async () => {
  try {
    // Find orders that are pending and older than 48 hours + 24 hour grace period
    const expirationTime = new Date();
    expirationTime.setHours(expirationTime.getHours() - 72); // 3 days total

    const expiredOrders = await Order.find({
      status: 'pending',
      createdAt: { $lt: expirationTime }
    }).populate('user', 'name email');

    let cancelledCount = 0;

    for (const order of expiredOrders) {
      try {
        // Update order status to cancelled
        order.status = 'cancelled';
        order.cancelledAt = new Date();
        order.cancellationReason = 'Expired - No payment received within 72 hours';
        order.updatedAt = new Date();
        
        await order.save();
        
        // Notify user about cancellation
        if (order.user) {
          notifyOrderUpdate(order.user._id, {
            _id: order._id,
            orderNumber: order.orderNumber,
            status: 'cancelled'
          });
        }
        
        cancelledCount++;
        console.log(`📦 Cancelled expired order: ${order.orderNumber}`);
        
      } catch (error) {
        console.error(`Error cancelling order ${order.orderNumber}:`, error);
      }
    }

    if (cancelledCount > 0) {
      console.log(`✅ Cancelled ${cancelledCount} expired orders`);
    } else {
      console.log('✅ No expired orders found');
    }

    return cancelledCount;
    
  } catch (error) {
    console.error('❌ Error in cancelExpiredOrders:', error);
    return 0;
  }
};

// Update order status with notifications
const updateOrderStatus = async (orderId, newStatus, updatedBy = null) => {
  try {
    const order = await Order.findById(orderId).populate('user', 'name email');
    
    if (!order) {
      throw new Error('Order not found');
    }

    const oldStatus = order.status;
    order.status = newStatus;
    order.updatedAt = new Date();
    
    // Add status-specific fields
    switch (newStatus) {
      case 'confirmed':
        order.confirmedAt = new Date();
        break;
      case 'processing':
        order.processingAt = new Date();
        break;
      case 'shipped':
        order.shippedAt = new Date();
        break;
      case 'completed':
        order.completedAt = new Date();
        break;
      case 'cancelled':
        order.cancelledAt = new Date();
        if (!order.cancellationReason) {
          order.cancellationReason = 'Cancelled by admin';
        }
        break;
    }

    if (updatedBy) {
      order.lastUpdatedBy = updatedBy;
    }

    await order.save();

    // Notify user about status change
    if (order.user) {
      notifyOrderUpdate(order.user._id, {
        _id: order._id,
        orderNumber: order.orderNumber,
        status: newStatus,
        previousStatus: oldStatus
      });
    }

    console.log(`📦 Order ${order.orderNumber} status updated: ${oldStatus} → ${newStatus}`);
    
    return order;
    
  } catch (error) {
    console.error('Error updating order status:', error);
    throw error;
  }
};

// Validate order items
const validateOrderItems = async (items) => {
  const errors = [];
  
  if (!Array.isArray(items) || items.length === 0) {
    errors.push('Order must contain at least one item');
    return { isValid: false, errors };
  }

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    
    if (!item.product) {
      errors.push(`Item ${i + 1}: Product ID is required`);
      continue;
    }
    
    if (!item.quantity || item.quantity < 1) {
      errors.push(`Item ${i + 1}: Quantity must be at least 1`);
    }
    
    if (!item.price || item.price < 0) {
      errors.push(`Item ${i + 1}: Valid price is required`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Get order status display info
const getOrderStatusInfo = (status) => {
  const statusInfo = {
    pending: {
      label: 'Pending Payment',
      color: 'yellow',
      description: 'Waiting for payment confirmation',
      canCancel: true,
      canEdit: true
    },
    confirmed: {
      label: 'Payment Confirmed',
      color: 'blue',
      description: 'Payment received, preparing order',
      canCancel: true,
      canEdit: false
    },
    processing: {
      label: 'Processing',
      color: 'purple',
      description: 'Order is being prepared',
      canCancel: true,
      canEdit: false
    },
    shipped: {
      label: 'Shipped',
      color: 'indigo',
      description: 'Order has been shipped',
      canCancel: false,
      canEdit: false
    },
    completed: {
      label: 'Completed',
      color: 'green',
      description: 'Order delivered successfully',
      canCancel: false,
      canEdit: false
    },
    cancelled: {
      label: 'Cancelled',
      color: 'red',
      description: 'Order has been cancelled',
      canCancel: false,
      canEdit: false
    }
  };

  return statusInfo[status] || {
    label: 'Unknown',
    color: 'gray',
    description: 'Unknown status',
    canCancel: false,
    canEdit: false
  };
};

// Format order for API response
const formatOrderForResponse = (order) => {
  const formattedOrder = {
    id: order._id,
    orderNumber: order.orderNumber,
    status: order.status,
    statusInfo: getOrderStatusInfo(order.status),
    items: order.items,
    subtotal: order.subtotal,
    shippingCost: order.shippingCost,
    tax: order.tax,
    total: order.total,
    shippingAddress: order.shippingAddress,
    billingAddress: order.billingAddress,
    paymentMethod: order.paymentMethod,
    paymentStatus: order.paymentStatus,
    notes: order.notes,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt
  };

  // Add status-specific timestamps
  if (order.confirmedAt) formattedOrder.confirmedAt = order.confirmedAt;
  if (order.processingAt) formattedOrder.processingAt = order.processingAt;
  if (order.shippedAt) formattedOrder.shippedAt = order.shippedAt;
  if (order.completedAt) formattedOrder.completedAt = order.completedAt;
  if (order.cancelledAt) formattedOrder.cancelledAt = order.cancelledAt;
  if (order.cancellationReason) formattedOrder.cancellationReason = order.cancellationReason;

  // Add user info if populated
  if (order.user) {
    formattedOrder.user = {
      id: order.user._id,
      name: order.user.name,
      email: order.user.email
    };
  }

  return formattedOrder;
};

// Extend order expiration (for admin use)
const extendOrderExpiration = async (orderId, extensionHours = 24) => {
  try {
    const order = await Order.findById(orderId).populate('user', 'name email');
    
    if (!order) {
      throw new Error('Order not found');
    }
    
    if (order.status !== 'pending') {
      throw new Error('Can only extend expiration for pending orders');
    }
    
    // Calculate new expiration time
    const currentExpiration = order.expiresAt || new Date(order.createdAt.getTime() + 72 * 60 * 60 * 1000);
    const newExpiration = new Date(currentExpiration.getTime() + extensionHours * 60 * 60 * 1000);
    
    order.expiresAt = newExpiration;
    order.extensionCount = (order.extensionCount || 0) + 1;
    order.lastExtendedAt = new Date();
    order.updatedAt = new Date();
    
    await order.save();
    
    // Notify user about extension
    if (order.user) {
      notifyOrderUpdate(order.user._id, {
        _id: order._id,
        orderNumber: order.orderNumber,
        status: 'extended',
        expiresAt: newExpiration,
        extensionHours
      });
    }
    
    console.log(`📦 Extended order expiration: ${order.orderNumber} by ${extensionHours} hours`);
    
    return order;
    
  } catch (error) {
    console.error('Error extending order expiration:', error);
    throw error;
  }
};

module.exports = {
  generateOrderNumber,
  calculateOrderTotal,
  cancelExpiredOrders,
  updateOrderStatus,
  validateOrderItems,
  getOrderStatusInfo,
  formatOrderForResponse,
  extendOrderExpiration
};