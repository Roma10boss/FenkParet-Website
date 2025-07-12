// components/admin/NotificationPanel.js
import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import {
  BellIcon,
  XMarkIcon,
  CheckIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  ShoppingCartIcon,
  UserIcon
} from '@heroicons/react/24/outline';

const NotificationPanel = () => {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    loadNotifications();
    
    // Check for new notifications every 30 seconds
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadNotifications = () => {
    try {
      const stored = localStorage.getItem('adminNotifications');
      let allNotifications = stored ? JSON.parse(stored) : [];
      
      // Add some sample notifications if none exist
      if (allNotifications.length === 0) {
        allNotifications = generateSampleNotifications();
        localStorage.setItem('adminNotifications', JSON.stringify(allNotifications));
      }
      
      // Sort by timestamp, newest first
      allNotifications.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      
      setNotifications(allNotifications);
      setUnreadCount(allNotifications.filter(n => !n.read).length);
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const generateSampleNotifications = () => {
    const now = new Date();
    return [
      {
        id: '1',
        type: 'order',
        title: 'Nouvelle commande',
        message: 'Commande #1234 - 2 articles pour 450 HTG',
        timestamp: new Date(now.getTime() - 5 * 60000).toISOString(), // 5 minutes ago
        read: false,
        icon: ShoppingCartIcon,
        color: 'text-blue-600'
      },
      {
        id: '2',
        type: 'user',
        title: 'Nouvel utilisateur',
        message: 'Jean Dupont s\'est inscrit',
        timestamp: new Date(now.getTime() - 15 * 60000).toISOString(), // 15 minutes ago
        read: false,
        icon: UserIcon,
        color: 'text-green-600'
      },
      {
        id: '3',
        type: 'warning',
        title: 'Stock faible',
        message: 'T-Shirt Premium - Il ne reste que 3 unités',
        timestamp: new Date(now.getTime() - 30 * 60000).toISOString(), // 30 minutes ago
        read: true,
        icon: ExclamationTriangleIcon,
        color: 'text-yellow-600'
      },
      {
        id: '4',
        type: 'info',
        title: 'Rapport mensuel',
        message: 'Votre rapport mensuel est prêt à être consulté',
        timestamp: new Date(now.getTime() - 60 * 60000).toISOString(), // 1 hour ago
        read: true,
        icon: InformationCircleIcon,
        color: 'text-purple-600'
      }
    ];
  };

  const markAsRead = (notificationId) => {
    setNotifications(prev => {
      const updated = prev.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      );
      localStorage.setItem('adminNotifications', JSON.stringify(updated));
      return updated;
    });
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications(prev => {
      const updated = prev.map(n => ({ ...n, read: true }));
      localStorage.setItem('adminNotifications', JSON.stringify(updated));
      return updated;
    });
    setUnreadCount(0);
    toast.success('Toutes les notifications marquées comme lues');
  };

  const clearNotification = (notificationId) => {
    setNotifications(prev => {
      const notification = prev.find(n => n.id === notificationId);
      const updated = prev.filter(n => n.id !== notificationId);
      localStorage.setItem('adminNotifications', JSON.stringify(updated));
      
      if (notification && !notification.read) {
        setUnreadCount(prevCount => Math.max(0, prevCount - 1));
      }
      
      return updated;
    });
    toast.success('Notification supprimée');
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    setUnreadCount(0);
    localStorage.setItem('adminNotifications', JSON.stringify([]));
    toast.success('Toutes les notifications supprimées');
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now - time) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'À l\'instant';
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`;
    return `${Math.floor(diffInMinutes / 1440)}j`;
  };

  return (
    <div className="relative">
      {/* Notification Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-theme-secondary hover:text-theme-primary transition-colors rounded-lg hover:bg-theme-secondary"
      >
        <BellIcon className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-error-color text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Panel */}
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-full mt-2 w-80 bg-theme-primary border border-theme rounded-lg shadow-lg z-50 max-h-96 overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-theme flex items-center justify-between">
              <h3 className="text-lg font-semibold text-theme-primary">
                Notifications
                {unreadCount > 0 && (
                  <span className="ml-2 text-sm text-theme-secondary">
                    ({unreadCount} non lues)
                  </span>
                )}
              </h3>
              <div className="flex items-center space-x-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-xs text-accent hover:text-accent-hover"
                  >
                    Tout marquer lu
                  </button>
                )}
                {notifications.length > 0 && (
                  <button
                    onClick={clearAllNotifications}
                    className="text-xs text-error-color hover:text-red-700"
                  >
                    Tout effacer
                  </button>
                )}
              </div>
            </div>

            {/* Notifications List */}
            <div className="max-h-72 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-6 text-center text-theme-secondary">
                  <BellIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Aucune notification</p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 border-b border-theme last:border-b-0 hover:bg-theme-secondary transition-colors ${
                      !notification.read ? 'bg-accent/5' : ''
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`flex-shrink-0 p-1 ${notification.color}`}>
                        <notification.icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <h4 className={`text-sm font-medium ${
                            !notification.read ? 'text-theme-primary' : 'text-theme-secondary'
                          }`}>
                            {notification.title}
                          </h4>
                          <div className="flex items-center space-x-1 ml-2">
                            <span className="text-xs text-theme-tertiary flex-shrink-0">
                              {formatTimeAgo(notification.timestamp)}
                            </span>
                            <button
                              onClick={() => clearNotification(notification.id)}
                              className="text-theme-tertiary hover:text-error-color"
                            >
                              <XMarkIcon className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        <p className="text-sm text-theme-secondary mt-1">
                          {notification.message}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          {!notification.read && (
                            <button
                              onClick={() => markAsRead(notification.id)}
                              className="text-xs text-accent hover:text-accent-hover flex items-center space-x-1"
                            >
                              <CheckIcon className="w-3 h-3" />
                              <span>Marquer comme lu</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationPanel;