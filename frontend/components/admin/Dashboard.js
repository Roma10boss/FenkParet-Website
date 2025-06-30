// components/admin/Dashboard.js
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { 
  CurrencyDollarIcon,
  DocumentTextIcon,
  UsersIcon,
  ExclamationTriangleIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  EyeIcon,
  CubeIcon,
  EnvelopeIcon,
  PlusIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

// Create a simple arrow component as fallback
const ArrowTopRightIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
  </svg>
);

import Card from './Card';

const StatCard = ({ 
  title, 
  value, 
  icon: Icon, 
  linkHref, 
  linkText, 
  change, 
  changeType,
  bgGradient = 'from-blue-500 to-blue-600',
  iconBg = 'bg-blue-100 dark:bg-blue-900/20',
  iconColor = 'text-blue-600 dark:text-blue-400'
}) => {
  // Fallback for TrendIcon if changeType is undefined
  const TrendIcon = changeType === 'positive' ? TrendingUpIcon : 
                   changeType === 'negative' ? TrendingDownIcon : 
                   null;
  
  return (
    <div className="admin-card admin-fade-in group cursor-pointer">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-4">
            <div className={`p-3 rounded-xl ${iconBg} group-hover:scale-110 transition-transform duration-200`}>
              {Icon && typeof Icon === 'function' ? (
                <Icon className={`w-6 h-6 ${iconColor}`} />
              ) : (
                <div className={`w-6 h-6 ${iconColor} flex items-center justify-center text-xl`}>
                  📊
                </div>
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-theme-secondary uppercase tracking-wide">{title}</p>
              {change && TrendIcon && typeof TrendIcon === 'function' && (
                <div className={`flex items-center space-x-1 text-sm ${
                  changeType === 'positive' ? 'text-success-color' : 'text-error-color'
                }`}>
                  <TrendIcon className="w-4 h-4" />
                  <span>{Math.abs(change)}%</span>
                </div>
              )}
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-3xl font-bold text-theme-primary">{value}</p>
            {linkHref && (
              <Link 
                href={linkHref} 
                className="inline-flex items-center space-x-1 text-sm text-accent hover:text-accent-dark transition-colors group"
              >
                <span>{linkText}</span>
                <ArrowTopRightIcon />
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const DashboardComponents = ({ stats, recentOrders, topProducts }) => {
  const router = useRouter();
  const [loadingAction, setLoadingAction] = useState(null);

  // Handle quick action clicks with loading state
  const handleQuickAction = async (path, actionName) => {
    setLoadingAction(actionName);
    try {
      await router.push(path);
    } catch (error) {
      console.error('Navigation error:', error);
    } finally {
      setLoadingAction(null);
    }
  };

  // Handle keyboard navigation
  const handleKeyDown = (event, path, actionName) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleQuickAction(path, actionName);
    }
  };

  return (
    <div className="space-y-8 admin-fade-in">
      {/* Overview Stats */}
      <div className="admin-grid admin-grid-cols-4">
        <StatCard
          title="Total Sales"
          value={`$${stats.totalSales?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}`}
          icon={CurrencyDollarIcon}
          iconBg="bg-green-100 dark:bg-green-900/20"
          iconColor="text-green-600 dark:text-green-400"
          change={stats.salesChange}
          changeType={stats.salesChangeType}
        />
        <StatCard
          title="Total Orders"
          value={stats.totalOrders?.toLocaleString() || '0'}
          icon={DocumentTextIcon}
          iconBg="bg-blue-100 dark:bg-blue-900/20"
          iconColor="text-blue-600 dark:text-blue-400"
          linkHref="/admin/orders"
          linkText="View All Orders"
          change={stats.ordersChange}
          changeType={stats.ordersChangeType}
        />
        <StatCard
          title="New Users"
          value={stats.newUsers?.toLocaleString() || '0'}
          icon={UsersIcon}
          iconBg="bg-purple-100 dark:bg-purple-900/20"
          iconColor="text-purple-600 dark:text-purple-400"
          linkHref="/admin/users"
          linkText="View All Users"
          change={stats.usersChange}
          changeType={stats.usersChangeType}
        />
        <StatCard
          title="Low Stock Items"
          value={stats.lowStockItems?.toLocaleString() || '0'}
          icon={ExclamationTriangleIcon}
          iconBg="bg-yellow-100 dark:bg-yellow-900/20"
          iconColor="text-yellow-600 dark:text-yellow-400"
          linkHref="/admin/products?stock=low"
          linkText="Manage Stock"
          change={stats.stockChange}
          changeType={stats.stockChangeType}
        />
      </div>

      {/* Recent Orders Table */}
      <div className="admin-card admin-slide-up">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-theme-primary">Recent Orders</h2>
          <Link 
            href="/admin/orders" 
            className="inline-flex items-center space-x-2 text-accent hover:text-accent-dark transition-colors"
          >
            <span className="text-sm font-medium">View All</span>
            <EyeIcon className="w-4 h-4" />
          </Link>
        </div>
        {recentOrders && recentOrders.length > 0 ? (
          <div className="overflow-x-auto admin-scrollbar">
            <table className="admin-table w-full">
              <thead>
                <tr>
                  <th className="text-left">Order ID</th>
                  <th className="text-left">Customer</th>
                  <th className="text-left">Amount</th>
                  <th className="text-left">Status</th>
                  <th className="text-left">Date</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order, index) => (
                  <tr key={order.id} className="admin-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                    <td className="font-mono text-sm">
                      <span className="px-2 py-1 bg-theme-secondary rounded-md">
                        #{order.id}
                      </span>
                    </td>
                    <td className="font-medium">{order.customer}</td>
                    <td className="font-semibold text-theme-primary">
                      ${order.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td>
                      <span className={`admin-badge ${
                        order.status === 'Completed' ? 'admin-badge-success' :
                        order.status === 'Pending' ? 'admin-badge-warning' :
                        'admin-badge-error'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="text-theme-secondary">{order.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <DocumentTextIcon className="w-12 h-12 text-theme-secondary mx-auto mb-4" />
            <p className="text-theme-secondary">No recent orders</p>
          </div>
        )}
      </div>

      {/* Top Selling Products */}
      <div className="admin-card admin-slide-up">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-theme-primary">Top Selling Products</h2>
          <Link 
            href="/admin/products" 
            className="inline-flex items-center space-x-2 text-accent hover:text-accent-dark transition-colors"
          >
            <span className="text-sm font-medium">View All</span>
            <EyeIcon className="w-4 h-4" />
          </Link>
        </div>
        {topProducts && topProducts.length > 0 ? (
          <div className="space-y-4">
            {topProducts.map((product, index) => (
              <div key={product.id} className="activity-item admin-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-accent-light rounded-lg flex items-center justify-center">
                      <span className="text-sm font-semibold text-accent">{index + 1}</span>
                    </div>
                    <div>
                      <p className="font-medium text-theme-primary">{product.name}</p>
                      <p className="text-sm text-theme-secondary">{product.category || 'Product'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold text-theme-primary">{product.units}</p>
                    <p className="text-sm text-theme-secondary">units sold</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <CurrencyDollarIcon className="w-12 h-12 text-theme-secondary mx-auto mb-4" />
            <p className="text-theme-secondary">No top products</p>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="admin-card admin-scale-in">
        <h2 className="text-xl font-semibold text-theme-primary mb-6">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button 
            onClick={() => handleQuickAction('/admin/products', 'products')}
            onKeyDown={(e) => handleKeyDown(e, '/admin/products', 'products')}
            disabled={loadingAction === 'products'}
            aria-label="Navigate to Products Management"
            aria-describedby="products-description"
            className="flex flex-col items-center p-6 rounded-xl bg-theme-secondary hover:bg-accent-light transition-all duration-200 hover:transform hover:scale-105 group disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2"
          >
            <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              {loadingAction === 'products' ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <CubeIcon className="w-6 h-6 text-white" />
              )}
            </div>
            <span className="font-medium text-theme-primary group-hover:text-accent">
              {loadingAction === 'products' ? 'Loading...' : 'Manage Products'}
            </span>
          </button>

          <button 
            onClick={() => handleQuickAction('/admin/orders', 'orders')}
            disabled={loadingAction === 'orders'}
            className="flex flex-col items-center p-6 rounded-xl bg-theme-secondary hover:bg-accent-light transition-all duration-200 hover:transform hover:scale-105 group disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              {loadingAction === 'orders' ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <DocumentTextIcon className="w-6 h-6 text-white" />
              )}
            </div>
            <span className="font-medium text-theme-primary group-hover:text-accent">
              {loadingAction === 'orders' ? 'Loading...' : 'View Orders'}
            </span>
          </button>

          <button 
            onClick={() => handleQuickAction('/admin/users', 'users')}
            disabled={loadingAction === 'users'}
            className="flex flex-col items-center p-6 rounded-xl bg-theme-secondary hover:bg-accent-light transition-all duration-200 hover:transform hover:scale-105 group disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              {loadingAction === 'users' ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <UsersIcon className="w-6 h-6 text-white" />
              )}
            </div>
            <span className="font-medium text-theme-primary group-hover:text-accent">
              {loadingAction === 'users' ? 'Loading...' : 'Manage Users'}
            </span>
          </button>

          <button 
            onClick={() => handleQuickAction('/admin/tickets', 'tickets')}
            disabled={loadingAction === 'tickets'}
            className="flex flex-col items-center p-6 rounded-xl bg-theme-secondary hover:bg-accent-light transition-all duration-200 hover:transform hover:scale-105 group disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              {loadingAction === 'tickets' ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <EnvelopeIcon className="w-6 h-6 text-white" />
              )}
            </div>
            <span className="font-medium text-theme-primary group-hover:text-accent">
              {loadingAction === 'tickets' ? 'Loading...' : 'Support Tickets'}
            </span>
          </button>

          {/* Analytics Quick Action - Hidden on mobile, shown on larger screens */}
          <button 
            onClick={() => handleQuickAction('/admin/analytics', 'analytics')}
            disabled={loadingAction === 'analytics'}
            className="hidden md:flex flex-col items-center p-6 rounded-xl bg-theme-secondary hover:bg-accent-light transition-all duration-200 hover:transform hover:scale-105 group disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="w-12 h-12 bg-indigo-500 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              {loadingAction === 'analytics' ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <ChartBarIcon className="w-6 h-6 text-white" />
              )}
            </div>
            <span className="font-medium text-theme-primary group-hover:text-accent">
              {loadingAction === 'analytics' ? 'Loading...' : 'Analytics'}
            </span>
          </button>
        </div>

        {/* Mobile row for additional actions */}
        <div className="grid grid-cols-2 gap-4 mt-4 md:hidden">
          <button 
            onClick={() => handleQuickAction('/admin/analytics', 'analytics')}
            disabled={loadingAction === 'analytics'}
            className="flex flex-col items-center p-4 rounded-xl bg-theme-secondary hover:bg-accent-light transition-all duration-200 hover:transform hover:scale-105 group disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              {loadingAction === 'analytics' ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <ChartBarIcon className="w-5 h-5 text-white" />
              )}
            </div>
            <span className="text-sm font-medium text-theme-primary group-hover:text-accent">
              {loadingAction === 'analytics' ? 'Loading...' : 'Analytics'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardComponents;