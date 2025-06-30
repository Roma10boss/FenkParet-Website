// components/admin/Charts.js
import React from 'react';

const ChartCard = ({ title, chartType }) => (
  <div className="admin-card">
    <h3 className="text-lg font-semibold mb-4">{title}</h3>
    <div className="h-64 flex items-center justify-center bg-gray-100 rounded-md">
      <p className="text-gray-500">A beautiful {chartType} chart will be here.</p>
    </div>
  </div>
);

const Charts = ({ chartsData }) => {
  if (!chartsData) return null;

  return (
    <div className="space-y-6">
      <ChartCard title="Sales Over Time" chartType="line" />
      <ChartCard title="Order Status Distribution" chartType="pie" />
      <ChartCard title="Top Selling Products" chartType="bar" />
    </div>
  );
};

export default Charts;