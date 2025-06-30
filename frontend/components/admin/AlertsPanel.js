// components/admin/AlertsPanel.js
import { useState } from 'react';
import Link from 'next/link';

// Simple useAlert hook for basic alert functionality
export const useAlert = () => {
  const showSuccess = (message) => {
    console.log('✅ Success:', message);
    // You can integrate with toast library here
  };

  const showError = (message) => {
    console.error('❌ Error:', message);
    // You can integrate with toast library here
  };

  const showWarning = (message) => {
    console.warn('⚠️ Warning:', message);
    // You can integrate with toast library here
  };

  const showInfo = (message) => {
    console.info('ℹ️ Info:', message);
    // You can integrate with toast library here
  };

  return {
    showSuccess,
    showError,
    showWarning,
    showInfo
  };
};

export const AlertsPanel = ({ lowStockProducts, notifications }) => {
  const [dismissedAlerts, setDismissedAlerts] = useState(new Set());
  const [activeTab, setActiveTab] = useState('stock');

  const dismissAlert = (alertId) => {
    setDismissedAlerts(prev => new Set([...prev, alertId]));
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Filter out dismissed alerts
  const visibleStockAlerts = lowStockProducts?.filter(product => 
    !dismissedAlerts.has(`stock-${product.id}`)
  ) || [];

  const visibleNotifications = notifications?.filter(notification => 
    !dismissedAlerts.has(`notification-${notification.id}`)
  ) || [];

  const tabs = [
    { 
      id: 'stock', 
      name: 'Stock Alerts', 
      count: visibleStockAlerts.length,
      icon: '📦'
    },
    { 
      id: 'notifications', 
      name: 'Notifications', 
      count: visibleNotifications.length,
      icon: '🔔'
    }
  ];

  const getAlertPriority = (item) => {
    if (item.stock === 0) return 'critical';
    if (item.stock <= 5) return 'high';
    if (item.stock <= 10) return 'medium';
    return 'low';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      'critical': 'bg-red-100 border-red-200 text-red-800',
      'high': 'bg-orange-100 border-orange-200 text-orange-800',
      'medium': 'bg-yellow-100 border-yellow-200 text-yellow-800',
      'low': 'bg-blue-100 border-blue-200 text-blue-800'
    };
    return colors[priority] || colors.low;
  };

  const getNotificationTypeColor = (type) => {
    const colors = {
      'support': 'bg-purple-100 border-purple-200 text-purple-800',
      'order': 'bg-blue-100 border-blue-200 text-blue-800',
      'payment': 'bg-green-100 border-green-200 text-green-800',
      'system': 'bg-gray-100 border-gray-200 text-gray-800',
      'warning': 'bg-orange-100 border-orange-200 text-orange-800'
    };
    return colors[type] || colors.system;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Alerts & Notifications</h2>
            <p className="text-sm text-gray-600">Important system alerts and updates</p>
          </div>
          
          {/* Alert Summary */}
          <div className="flex items-center space-x-2">
            {(visibleStockAlerts.length > 0 || visibleNotifications.length > 0) && (
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-red-600 font-medium">
                  {visibleStockAlerts.length + visibleNotifications.length} alerts
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <nav className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.name}
              {tab.count > 0 && (
                <span className={`ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                  activeTab === tab.id ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === 'stock' && (
          <div className="space-y-3">
            {visibleStockAlerts.length > 0 ? (
              <>
                {visibleStockAlerts.map((product) => {
                  const priority = getAlertPriority(product);
                  return (
                    <div
                      key={product.id}
                      className={`p-4 rounded-lg border-2 ${getPriorityColor(priority)}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center">
                            <h4 className="font-medium text-gray-900">{product.name}</h4>
                            <span className={`ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              priority === 'critical' ? 'bg-red-600 text-white' :
                              priority === 'high' ? 'bg-orange-600 text-white' :
                              priority === 'medium' ? 'bg-yellow-600 text-white' :
                              'bg-blue-600 text-white'
                            }`}>
                              {priority.toUpperCase()}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            {product.stock === 0 ? 'Out of stock' : `Only ${product.stock} items left`}
                          </p>
                          <div className="flex items-center mt-2 space-x-4">
                            <Link 
                              href={`/admin/products/${product.id}`}
                              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                            >
                              View Product
                            </Link>
                            <Link 
                              href={`/admin/products/${product.id}/restock`}
                              className="text-sm text-green-600 hover:text-green-800 font-medium"
                            >
                              Restock Now
                            </Link>
                          </div>
                        </div>
                        
                        <button
                          onClick={() => dismissAlert(`stock-${product.id}`)}
                          className="text-gray-400 hover:text-gray-600 ml-4"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  );
                })}
                
                <div className="text-center pt-4">
                  <Link 
                    href="/admin/products?filter=low-stock"
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    View all low stock products →
                  </Link>
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <div className="text-green-400 text-4xl mb-4">✅</div>
                <p className="text-gray-500">All products are well stocked</p>
                <p className="text-gray-400 text-sm mt-1">No inventory alerts at this time</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="space-y-3">
            {visibleNotifications.length > 0 ? (
              <>
                {visibleNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 rounded-lg border-2 ${getNotificationTypeColor(notification.type)}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center">
                          <h4 className="font-medium text-gray-900">{notification.title}</h4>
                          <span className="ml-2 text-xs text-gray-500">
                            {formatDate(notification.createdAt)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                        
                        {notification.actionUrl && (
                          <div className="mt-2">
                            <Link 
                              href={notification.actionUrl}
                              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                            >
                              {notification.actionText || 'View Details'}
                            </Link>
                          </div>
                        )}
                      </div>
                      
                      <button
                        onClick={() => dismissAlert(`notification-${notification.id}`)}
                        className="text-gray-400 hover:text-gray-600 ml-4"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
                
                <div className="text-center pt-4">
                  <Link 
                    href="/admin/notifications"
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    View all notifications →
                  </Link>
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <div className="text-gray-400 text-4xl mb-4">🔔</div>
                <p className="text-gray-500">No notifications</p>
                <p className="text-gray-400 text-sm mt-1">You&apos;re all caught up!</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Quick Actions for Alerts */}
      {(visibleStockAlerts.length > 0 || visibleNotifications.length > 0) && (
        <div className="px-6 pb-6 border-t border-gray-200">
          <div className="pt-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-900">Quick Actions</h3>
              <button
                onClick={() => {
                  // Dismiss all alerts
                  const allIds = [
                    ...visibleStockAlerts.map(p => `stock-${p.id}`),
                    ...visibleNotifications.map(n => `notification-${n.id}`)
                  ];
                  setDismissedAlerts(prev => new Set([...prev, ...allIds]));
                }}
                className="text-xs text-gray-500 hover:text-gray-700"
              >
                Dismiss All
              </button>
            </div>
            
            <div className="mt-3 flex space-x-2">
              {visibleStockAlerts.length > 0 && (
                <Link
                  href="/admin/products/bulk-restock"
                  className="px-3 py-2 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
                >
                  Bulk Restock
                </Link>
              )}
              
              {visibleNotifications.length > 0 && (
                <Link
                  href="/admin/notifications"
                  className="px-3 py-2 bg-gray-600 text-white text-xs rounded hover:bg-gray-700 transition-colors"
                >
                  Manage All
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};