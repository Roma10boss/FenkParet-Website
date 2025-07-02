// pages/admin/analytics.js
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import AdminLayout from '../../components/admin/AdminLayout';
import Card from '../../components/admin/Card';
import DashboardStats from '../../components/admin/DashboardStats';
import Charts from '../../components/admin/Charts';

const AnalyticsPage = () => {
  const router = useRouter();
  const [analytics, setAnalytics] = useState({
    overview: null,
    charts: null,
    loading: true
  });
  const [dateRange, setDateRange] = useState('30d');

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const fetchAnalytics = useCallback(async () => {
    try {
      setAnalytics(prev => ({ ...prev, loading: true }));
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://fenkparet-backend.onrender.com'}/api/admin/analytics?period=${dateRange}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch analytics');
      }

      const data = await response.json();
      setAnalytics({
        overview: data.overview,
        charts: data.charts,
        loading: false
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
      setAnalytics(prev => ({ ...prev, loading: false }));
    }
  }, [dateRange]);

  if (analytics.loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{'analytics_dashboard'}</h1>
          <p className="text-gray-600 dark:text-gray-400">{'business_insights_metrics'}</p>
        </div>
        <div className="flex space-x-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="7d">{'last_7_days'}</option>
            <option value="30d">{'last_30_days'}</option>
            <option value="90d">{'last_90_days'}</option>
            <option value="1y">{'last_year'}</option>
          </select>
          <button
            onClick={() => router.push('/admin/sales-analytics')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            {'detailed_sales_report'}
          </button>
        </div>
      </div>

      {/* Overview Stats */}
      <DashboardStats stats={analytics.overview} />

      {/* Charts */}
      <Charts chartsData={analytics} />

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{'conversion_rates'}</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">{'product_page_views'}</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">3.2%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
              <div className="bg-blue-600 h-2 rounded-full" style={{ width: '32%' }}></div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{'customer_insights'}</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center py-3 border-b border-gray-200 dark:border-gray-700">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{'avg_session_duration'}</p>
                <p className="text-xs text-gray-500">{'compared_to_last_month'}</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-gray-900 dark:text-white">4m 32s</p>
                <p className="text-xs text-green-600">+12%</p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Export Options */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{'export_analytics'}</h3>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => window.open(`${process.env.NEXT_PUBLIC_API_URL || 'https://fenkparet-backend.onrender.com'}/api/admin/analytics/export?format=pdf`, '_blank')}
            className="flex items-center justify-center px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            {'export_pdf'}
          </button>
          
          <button
            onClick={() => router.push('/admin/sales-analytics')}
            className="flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            {'advanced_analytics'}
          </button>
        </div>
      </Card>
      </div>
    </AdminLayout>
  );
};

export default AnalyticsPage;