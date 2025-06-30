// utils/socket.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

let io;

const setupSocketHandlers = (socketIo) => {
  io = socketIo;

  io.on('connection', async (socket) => {
    console.log(`🔌 New socket connection: ${socket.id}`);

    // Authentication middleware for socket
    socket.on('authenticate', async (data) => {
      try {
        const { token } = data;
        
        if (!token) {
          socket.emit('auth-error', { message: 'Token required' });
          return;
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
        const user = await User.findById(decoded.userId).select('-password');

        if (!user || !user.isActive) {
          socket.emit('auth-error', { message: 'Invalid user' });
          return;
        }

        socket.userId = user._id.toString();
        socket.userEmail = user.email;
        socket.isAdmin = user.isAdmin;
        socket.userName = user.name;

        socket.emit('authenticated', {
          message: 'Authentication successful',
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            isAdmin: user.isAdmin
          }
        });

        console.log(`✅ User authenticated: ${user.email} (${socket.id})`);

        // Join user-specific room
        socket.join(`user_${user._id}`);
        
        // Join admin room if user is admin
        if (user.isAdmin) {
          socket.join('admin');
          console.log(`👑 Admin joined admin room: ${user.email}`);
        }

      } catch (error) {
        console.error('Socket authentication error:', error);
        socket.emit('auth-error', { message: 'Authentication failed' });
      }
    });

    // Join user room
    socket.on('join-user', (data) => {
      if (socket.userId) {
        socket.join(`user_${socket.userId}`);
        console.log(`👤 User ${socket.userId} joined personal room`);
      }
    });

    // Join admin room
    socket.on('join-admin', (data) => {
      if (socket.isAdmin) {
        socket.join('admin');
        console.log(`👑 Admin ${socket.userId} joined admin room`);
      }
    });

    // Order tracking
    socket.on('track-order', (data) => {
      const { orderNumber } = data;
      if (socket.userId) {
        socket.join(`order_${orderNumber}`);
        console.log(`📦 User ${socket.userId} tracking order ${orderNumber}`);
      }
    });

    // Join specific room
    socket.on('join-room', (data) => {
      const { room } = data;
      if (socket.userId && room) {
        socket.join(room);
        console.log(`🏠 User ${socket.userId} joined room: ${room}`);
      }
    });

    // Leave specific room
    socket.on('leave-room', (data) => {
      const { room } = data;
      if (room) {
        socket.leave(room);
        console.log(`🚪 User ${socket.userId} left room: ${room}`);
      }
    });

    // Typing indicators for support chat
    socket.on('typing-start', (data) => {
      if (socket.userId) {
        socket.to('admin').emit('user-typing', {
          userId: socket.userId,
          userName: socket.userName
        });
      }
    });

    socket.on('typing-stop', (data) => {
      if (socket.userId) {
        socket.to('admin').emit('user-stopped-typing', {
          userId: socket.userId
        });
      }
    });

    // Admin typing in support
    socket.on('admin-typing-start', (data) => {
      const { userId } = data;
      if (socket.isAdmin && userId) {
        socket.to(`user_${userId}`).emit('admin-typing', {
          message: 'Support is typing...'
        });
      }
    });

    socket.on('admin-typing-stop', (data) => {
      const { userId } = data;
      if (socket.isAdmin && userId) {
        socket.to(`user_${userId}`).emit('admin-stopped-typing');
      }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`🔌 Socket disconnected: ${socket.id} (User: ${socket.userEmail || 'Unknown'})`);
    });

    // Error handling
    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  });

  console.log('🚀 Socket.IO handlers initialized');
};

// Helper functions to emit notifications
const emitToUser = (userId, event, data) => {
  if (io) {
    io.to(`user_${userId}`).emit(event, {
      ...data,
      timestamp: new Date().toISOString()
    });
  }
};

const emitToAdmin = (event, data) => {
  if (io) {
    io.to('admin').emit(event, {
      ...data,
      timestamp: new Date().toISOString()
    });
  }
};

const emitToAll = (event, data) => {
  if (io) {
    io.emit(event, {
      ...data,
      timestamp: new Date().toISOString()
    });
  }
};

const emitToOrder = (orderNumber, event, data) => {
  if (io) {
    io.to(`order_${orderNumber}`).emit(event, {
      ...data,
      timestamp: new Date().toISOString()
    });
  }
};

// Notification helpers
const notifyOrderUpdate = (userId, orderData) => {
  emitToUser(userId, 'order-update', {
    type: 'order_status_change',
    message: `Your order #${orderData.orderNumber} status has been updated to ${orderData.status}`,
    orderId: orderData._id,
    orderNumber: orderData.orderNumber,
    status: orderData.status,
    priority: 'normal'
  });
};

const notifyNewOrder = (orderData) => {
  emitToAdmin('new-order', {
    type: 'new_order',
    message: `New order received: #${orderData.orderNumber} - $${orderData.total}`,
    orderId: orderData._id,
    orderNumber: orderData.orderNumber,
    total: orderData.total,
    customerName: orderData.user?.name,
    priority: 'high'
  });
};

const notifyPaymentConfirmed = (userId, paymentData) => {
  emitToUser(userId, 'payment-confirmed', {
    type: 'payment_confirmed',
    message: `Payment confirmed for order #${paymentData.orderNumber}`,
    orderId: paymentData.orderId,
    orderNumber: paymentData.orderNumber,
    amount: paymentData.amount,
    priority: 'high'
  });
};

const notifyLowStock = (productData) => {
  emitToAdmin('low-stock', {
    type: 'inventory_alert',
    message: `Low stock alert: ${productData.name} (${productData.stock} remaining)`,
    productId: productData._id,
    productName: productData.name,
    stock: productData.stock,
    priority: 'urgent'
  });
};

const notifyTicketResponse = (userId, ticketData) => {
  emitToUser(userId, 'ticket-response', {
    type: 'support_response',
    message: `You have a new response to your support ticket #${ticketData.ticketNumber}`,
    ticketId: ticketData._id,
    ticketNumber: ticketData.ticketNumber,
    priority: 'normal'
  });
};

const notifyNewTicket = (ticketData) => {
  emitToAdmin('new-ticket', {
    type: 'new_support_ticket',
    message: `New support ticket: ${ticketData.subject} from ${ticketData.user?.name}`,
    ticketId: ticketData._id,
    ticketNumber: ticketData.ticketNumber,
    subject: ticketData.subject,
    customerName: ticketData.user?.name,
    priority: ticketData.priority || 'normal'
  });
};

const notifySystemAnnouncement = (announcement) => {
  emitToAll('system-announcement', {
    type: 'system_announcement',
    message: announcement.message,
    title: announcement.title,
    priority: announcement.priority || 'normal'
  });
};

const notifyPaymentConfirmationRequest = (orderData) => {
  emitToAdmin('payment-confirmation-request', {
    type: 'payment_confirmation_request',
    message: `New order #${orderData.orderNumber} requires payment confirmation (Confirmation #: ${orderData.payment.confirmationNumber})`,
    orderId: orderData._id,
    orderNumber: orderData.orderNumber,
    confirmationNumber: orderData.payment.confirmationNumber,
    total: orderData.pricing.total,
    customerEmail: orderData.customer.email,
    priority: 'high'
  });
};

module.exports = {
  setupSocketHandlers,
  emitToUser,
  emitToAdmin,
  emitToAll,
  emitToOrder,
  notifyOrderUpdate,
  notifyNewOrder,
  notifyPaymentConfirmed,
  notifyLowStock,
  notifyTicketResponse,
  notifyNewTicket,
  notifySystemAnnouncement,
  notifyPaymentConfirmationRequest
};