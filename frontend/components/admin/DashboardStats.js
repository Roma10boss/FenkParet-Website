// components/admin/DashboardStats.js
import React from 'react';
import { 
  TrendingUpIcon, 
  TrendingDownIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  UsersIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

const StatCard = ({ title, value, change, changeType, icon: Icon, format = 'number' }) => {
  const formatValue = (val) => {
    switch (format) {
      case 'currency': return `$${val.toLocaleString()}`;
      case 'percentage': return `${val.toFixed(2)}%`;
      default: return val.toLocaleString();
    }
  };

  // Fallback for TrendIcon if changeType is undefined
  const TrendIcon = changeType === 'positive' ? TrendingUpIcon : 
                   changeType === 'negative' ? TrendingDownIcon : 
                   null;

  return (
    <div className="admin-card admin-fade-in group hover:shadow-xl">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-4">
            <div className="stat-card-icon group-hover:scale-110 transition-all duration-300">
              {Icon && typeof Icon === 'function' ? (
                <Icon className="w-6 h-6" />
              ) : (
                <div className="w-6 h-6 flex items-center justify-center text-xl">
                  📊
                </div>
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-theme-secondary uppercase tracking-wide">{title}</p>
              {change !== undefined && TrendIcon && typeof TrendIcon === 'function' && (
                <div className={`flex items-center space-x-1 text-sm font-semibold ${
                  changeType === 'positive' ? 'text-success-color' : 'text-error-color'
                }`}>
                  <TrendIcon className="w-4 h-4" />
                  <span>{Math.abs(change).toFixed(1)}%</span>
                </div>
              )}
            </div>
          </div>
          <p className="text-3xl font-bold text-theme-primary group-hover:scale-105 transition-transform origin-left">
            {formatValue(value)}
          </p>
        </div>
      </div>
    </div>
  );
};

const DashboardStats = ({ stats }) => {
  if (!stats) {
    // Render skeleton loading state
    return (
      <div className="admin-grid admin-grid-cols-4">
        {[...Array(4)].map((_, index) => (
          <div key={index} className="admin-card">
            <div className="flex items-start space-x-3">
              <div className="w-12 h-12 bg-theme-secondary rounded-xl admin-skeleton" />
              <div className="flex-1 space-y-2">
                <div className="w-24 h-4 bg-theme-secondary rounded admin-skeleton" />
                <div className="w-16 h-8 bg-theme-secondary rounded admin-skeleton" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  const statCards = [
    { 
      title: 'Total Revenue', 
      value: stats.revenue?.current ?? 0, 
      change: stats.revenue?.change, 
      changeType: stats.revenue?.changeType ?? 'neutral', 
      format: 'currency', 
      icon: CurrencyDollarIcon 
    },
    { 
      title: 'Total Orders', 
      value: stats.orders?.current ?? 0, 
      change: stats.orders?.change, 
      changeType: stats.orders?.changeType ?? 'neutral', 
      icon: DocumentTextIcon 
    },
    { 
      title: 'New Customers', 
      value: stats.customers?.current ?? 0, 
      change: stats.customers?.change, 
      changeType: stats.customers?.changeType ?? 'neutral', 
      icon: UsersIcon 
    },
    { 
      title: 'Conversion Rate', 
      value: stats.conversionRate?.current ?? 0, 
      change: stats.conversionRate?.change, 
      changeType: stats.conversionRate?.changeType ?? 'neutral', 
      format: 'percentage', 
      icon: ChartBarIcon 
    },
  ];

  return (
    <div className="admin-grid admin-grid-cols-4">
      {statCards.map((stat, index) => (
        <div key={index} className="admin-scale-in" style={{ animationDelay: `${index * 0.1}s` }}>
          <StatCard {...stat} />
        </div>
      ))}
    </div>
  );
};

export default DashboardStats;