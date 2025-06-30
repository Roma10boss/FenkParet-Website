// components/admin/RecentActivity.js
import React from 'react';

const ActivityItem = ({ activity }) => {
  const { user, action, target, createdAt } = activity;

  return (
    <div className="activity-item flex items-center py-3">
      <div className="activity-item-icon w-8 h-8 rounded-full flex items-center justify-center mr-4">👥</div>
      <div className="flex-grow">
        <p className="text-sm">
          <span className="font-semibold">{user}</span> {action} <span className="font-semibold">{target}</span>
        </p>
        <p className="text-xs text-gray-500">{new Date(createdAt).toLocaleString()}</p>
      </div>
    </div>
  );
};

const RecentActivity = ({ recentOrders, pendingPayments }) => {
  const activities = [
    ...recentOrders.map(order => ({ ...order, type: 'order' })),
    ...pendingPayments.map(payment => ({ ...payment, type: 'payment' }))
  ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return (
    <div className="admin-card">
      <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
      <div>
        {activities.map(activity => <ActivityItem key={activity.id} activity={activity} />)}
      </div>
    </div>
  );
};

export default RecentActivity;