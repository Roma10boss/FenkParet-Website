// pages/admin/dashboard.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../hooks/useAuth';
import AdminLayout from '../../components/admin/AdminLayout';
import DashboardStats from '../../components/admin/DashboardStats';
import RecentActivity from '../../components/admin/RecentActivity';
import QuickActions from '../../components/admin/QuickActions';
import Charts from '../../components/admin/Charts';


export default function AdminDashboard() {
  const router = useRouter();
  const { user, loading, isAuthenticated, isAdmin } = useAuth();

  const [dashboardData, setDashboardData] = useState({
    stats: null,
    recentOrders: [],
    pendingPayments: [],
    chartsData: null,
    loading: true,
    error: null
  });

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/admin/login');
    } else if (!loading && !isAdmin) {
      router.push('/');
    }
  }, [user, loading, isAuthenticated, isAdmin, router]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!isAdmin || !isAuthenticated) return;
      
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://fenkparet-backend.onrender.com'}/api/admin/dashboard`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          setDashboardData({
            stats: {
              revenue: data.stats?.revenue || { current: 0, change: 0, changeType: 'neutral' },
              orders: data.stats?.orders || { current: 0, change: 0, changeType: 'neutral' },
              customers: data.stats?.customers || { current: 0, change: 0, changeType: 'neutral' },
              conversionRate: data.stats?.conversionRate || { current: 0, change: 0, changeType: 'neutral' },
            },
            recentOrders: data.recentOrders || [],
            pendingPayments: data.pendingPayments || [],
            chartsData: data.chartsData || {},
            loading: false,
            error: null
          });
        } else {
          setDashboardData(prev => ({ ...prev, error: `Failed to fetch data (${response.status})`, loading: false }));
        }
      } catch (error) {
        setDashboardData(prev => ({ ...prev, error: error.message, loading: false }));
      }
    };

    if (user && isAdmin) {
      fetchDashboardData();
    }
  }, [user, isAdmin, isAuthenticated]);

  if (loading || dashboardData.loading) {
    return <div className="admin-dashboard"><div className="admin-card">Loading...</div></div>;
  }

  if (dashboardData.error) {
    return <div className="admin-dashboard"><div className="admin-card">Error: {dashboardData.error}</div></div>;
  }

  return (
    <AdminLayout>
      <div className="admin-dashboard">
      <h1 className="text-3xl font-bold mb-6">Tableau de bord administrateur</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          <DashboardStats stats={dashboardData.stats} />
        </div>
        <div>
          <QuickActions />
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          <RecentActivity recentOrders={dashboardData.recentOrders} pendingPayments={dashboardData.pendingPayments} />
        </div>
        <div>
          <Charts chartsData={dashboardData.chartsData} />
        </div>
      </div>
      </div>
    </AdminLayout>
  );
}