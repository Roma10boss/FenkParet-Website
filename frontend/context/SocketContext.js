// context/SocketContext.js
import { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import { toast } from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { user, loading } = useAuth();
  
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [notifications, setNotifications] = useState([]);

  // Helper functions for notifications
  const addNotification = (notification) => {
    const newNotification = {
      ...notification,
      id: Date.now() + Math.random(),
      read: false,
      timestamp: new Date(notification.timestamp || Date.now()),
    };
    setNotifications(prev => [newNotification, ...prev].slice(0, 50));
  };

  const markAsRead = (notificationId) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === notificationId ? { ...notif, read: true } : notif
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notif => ({ ...notif, read: true }))
    );
  };

  const clearNotification = (notificationId) => {
    setNotifications(prev =>
      prev.filter(notif => notif.id !== notificationId)
    );
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const getUnreadCount = () => {
    return notifications.filter(notif => !notif.read).length;
  };

  // Initialize socket connection
  useEffect(() => {
    if (loading) return;

    if (!socket) {
      console.log('Creating new socket connection...');
      const newSocket = io(process.env.NEXT_PUBLIC_API_URL || 'https://fenkparet-backend.onrender.com', {
        autoConnect: false,
        query: { userId: user?._id || user?.id || '' }
      });
      setSocket(newSocket);
    }
  }, [loading, user]);

  // Manage socket events and connection
  useEffect(() => {
    if (!socket || loading) return;

    const handleConnect = () => {
      setConnected(true);
      console.log('Socket connected');
      
      if (user) {
        if (user.isAdmin || user.role === 'admin') {
          socket.emit('join-admin', { isAdmin: true });
        } else {
          socket.emit('join-user', { userId: user._id || user.id });
        }
      }
    };

    const handleDisconnect = () => {
      setConnected(false);
      console.log('Socket disconnected');
    };

    // Admin notifications
    const handleNewOrder = (notification) => {
      if (user?.isAdmin || user?.role === 'admin') {
        addNotification(notification);
        toast.success(notification.message, { duration: 6000, icon: '🛒' });
      }
    };

    const handleNewTicket = (notification) => {
      if (user?.isAdmin || user?.role === 'admin') {
        addNotification(notification);
        toast.success(notification.message, { duration: 6000, icon: '🎫' });
      }
    };

    const handlePaymentConfirmation = (notification) => {
      if (user?.isAdmin || user?.role === 'admin') {
        addNotification(notification);
        toast.error(notification.message, { duration: 8000, icon: '💳' });
      }
    };

    const handleLowStock = (notification) => {
      if (user?.isAdmin || user?.role === 'admin') {
        addNotification(notification);
        toast.error(notification.message, { duration: 6000, icon: '📦' });
      }
    };

    // User notifications
    const handleOrderUpdate = (notification) => {
      addNotification(notification);
      toast.success(notification.message, { duration: 5000, icon: '📋' });
    };

    const handlePaymentConfirmed = (notification) => {
      addNotification(notification);
      toast.success(notification.message, { duration: 6000, icon: '✅' });
    };

    const handleOrderCancelled = (notification) => {
      addNotification(notification);
      toast.error(notification.message, { duration: 6000, icon: '❌' });
    };

    const handleTicketResponse = (notification) => {
      addNotification(notification);
      toast.success(notification.message, { duration: 5000, icon: '💬' });
    };

    const handleSystemAnnouncement = (notification) => {
      addNotification(notification);
      const toastType = notification.priority === 'urgent' || notification.priority === 'high' ? 'error' : 'success';
      toast[toastType](notification.message, { duration: 8000, icon: '📢' });
    };

    const handleUserNotification = (notification) => {
      addNotification(notification);
      toast.success(notification.message);
    };

    const handleAdminNotification = (notification) => {
      if (user?.isAdmin || user?.role === 'admin') {
        addNotification(notification);
        toast.success(notification.message);
      }
    };

    // Attach event listeners
    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('new-order', handleNewOrder);
    socket.on('new-ticket', handleNewTicket);
    socket.on('payment-confirmation', handlePaymentConfirmation);
    socket.on('low-stock', handleLowStock);
    socket.on('order-update', handleOrderUpdate);
    socket.on('payment-confirmed', handlePaymentConfirmed);
    socket.on('order-cancelled', handleOrderCancelled);
    socket.on('ticket-response', handleTicketResponse);
    socket.on('system-announcement', handleSystemAnnouncement);
    socket.on('user-notification', handleUserNotification);
    socket.on('admin-notification', handleAdminNotification);

    // Connect/disconnect based on user status
    if (user) {
      socket.connect();
    } else {
      socket.disconnect();
      setNotifications([]);
    }

    // Cleanup
    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('new-order', handleNewOrder);
      socket.off('new-ticket', handleNewTicket);
      socket.off('payment-confirmation', handlePaymentConfirmation);
      socket.off('low-stock', handleLowStock);
      socket.off('order-update', handleOrderUpdate);
      socket.off('payment-confirmed', handlePaymentConfirmed);
      socket.off('order-cancelled', handleOrderCancelled);
      socket.off('ticket-response', handleTicketResponse);
      socket.off('system-announcement', handleSystemAnnouncement);
      socket.off('user-notification', handleUserNotification);
      socket.off('admin-notification', handleAdminNotification);
    };
  }, [socket, user, loading]);

  // Clean up socket on unmount
  useEffect(() => {
    return () => {
      if (socket) {
        socket.disconnect();
        socket.close();
      }
    };
  }, []);

  // Emit functions
  const trackOrder = (orderNumber) => {
    if (socket && connected) {
      socket.emit('track-order', { orderNumber });
    }
  };

  const joinRoom = (room) => {
    if (socket && connected) {
      socket.emit('join-room', { room });
    }
  };

  const leaveRoom = (room) => {
    if (socket && connected) {
      socket.emit('leave-room', { room });
    }
  };

  const value = {
    socket,
    connected,
    notifications,
    addNotification,
    markAsRead,
    markAllAsRead,
    clearNotification,
    clearAllNotifications,
    getUnreadCount,
    trackOrder,
    joinRoom,
    leaveRoom,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};