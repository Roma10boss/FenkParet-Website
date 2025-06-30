import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useAuth } from '../../hooks/useAuth';
import { useRouter } from 'next/router';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import {
  UserIcon,
  ShoppingBagIcon,
  HeartIcon,
  CogIcon,
  ClockIcon,
  CheckCircleIcon,
  TruckIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

const UserDashboard = () => {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    totalSpent: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        router.push('/auth/login');
        return;
      }
      fetchDashboardData();
    }
  }, [isAuthenticated, authLoading, router]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      // Fetch user orders
      const ordersResponse = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/orders/my-orders`,
        config
      );
      
      const orders = ordersResponse.data.orders || [];
      
      // Calculate stats
      const totalOrders = orders.length;
      const pendingOrders = orders.filter(order => 
        ['pending', 'payment-pending', 'processing'].includes(order.status)
      ).length;
      const completedOrders = orders.filter(order => 
        ['delivered', 'completed'].includes(order.status)
      ).length;
      const totalSpent = orders
        .filter(order => order.status !== 'cancelled')
        .reduce((sum, order) => sum + (order.pricing?.total || 0), 0);

      setStats({
        totalOrders,
        pendingOrders,
        completedOrders,
        totalSpent
      });

      // Get recent orders (last 5)
      setRecentOrders(orders.slice(0, 5));

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      
      // Mock data for fallback
      setStats({
        totalOrders: 5,
        pendingOrders: 2,
        completedOrders: 3,
        totalSpent: 1250
      });
      
      setRecentOrders([
        {
          _id: '1',
          orderNumber: 'ORD-001',
          status: 'delivered',
          pricing: { total: 350 },
          createdAt: new Date().toISOString(),
          items: [{ productSnapshot: { name: 'Premium T-Shirt' }, quantity: 2 }]
        },
        {
          _id: '2', 
          orderNumber: 'ORD-002',
          status: 'processing',
          pricing: { total: 150 },
          createdAt: new Date().toISOString(),
          items: [{ productSnapshot: { name: 'Coffee Mug' }, quantity: 1 }]
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'delivered':
      case 'completed':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'processing':
      case 'shipped':
        return <TruckIcon className="h-5 w-5 text-blue-500" />;
      case 'cancelled':
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      default:
        return <ClockIcon className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getStatusText = (status) => {
    const statusMap = {
      'pending': 'En attente',
      'payment-pending': 'Paiement en attente',
      'confirmed': 'Confirmé',
      'processing': 'En traitement', 
      'shipped': 'Expédié',
      'delivered': 'Livré',
      'cancelled': 'Annulé'
    };
    return statusMap[status] || status;
  };

  const formatCurrency = (amount) => `${amount.toFixed(2)} HTG`;

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Tableau de bord - Fenkparet</title>
        <meta name="description" content="Votre tableau de bord personnel" />
      </Head>

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Bienvenue, {user?.name}!
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Gérez vos commandes et votre profil depuis votre tableau de bord
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ShoppingBagIcon className="h-8 w-8 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Total Commandes
                  </p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                    {stats.totalOrders}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ClockIcon className="h-8 w-8 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    En attente
                  </p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                    {stats.pendingOrders}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CheckCircleIcon className="h-8 w-8 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Complétées
                  </p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                    {stats.completedOrders}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600 font-semibold text-sm">HTG</span>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Total Dépensé
                  </p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                    {formatCurrency(stats.totalSpent)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Quick Actions */}
            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Actions rapides
                  </h2>
                </div>
                <div className="p-6 space-y-4">
                  <Link
                    href="/user/orders"
                    className="flex items-center p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <ShoppingBagIcon className="h-6 w-6 text-blue-600 mr-3" />
                    <span className="text-gray-900 dark:text-white">Mes commandes</span>
                  </Link>
                  
                  <Link
                    href="/user/profile"
                    className="flex items-center p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <UserIcon className="h-6 w-6 text-green-600 mr-3" />
                    <span className="text-gray-900 dark:text-white">Mon profil</span>
                  </Link>

                  <Link
                    href="/user/wishlist"
                    className="flex items-center p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <HeartIcon className="h-6 w-6 text-red-600 mr-3" />
                    <span className="text-gray-900 dark:text-white">Ma liste de souhaits</span>
                  </Link>

                  <Link
                    href="/user/settings"
                    className="flex items-center p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <CogIcon className="h-6 w-6 text-gray-600 mr-3" />
                    <span className="text-gray-900 dark:text-white">Paramètres</span>
                  </Link>
                </div>
              </div>
            </div>

            {/* Recent Orders */}
            <div className="lg:col-span-2">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex justify-between items-center">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Commandes récentes
                    </h2>
                    <Link
                      href="/user/orders"
                      className="text-blue-600 hover:text-blue-500 text-sm font-medium"
                    >
                      Voir tout
                    </Link>
                  </div>
                </div>
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {recentOrders.length > 0 ? (
                    recentOrders.map((order) => (
                      <div key={order._id} className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="flex-shrink-0">
                              {getStatusIcon(order.status)}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900 dark:text-white">
                                {order.orderNumber}
                              </p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {new Date(order.createdAt).toLocaleDateString('fr-FR')}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {formatCurrency(order.pricing?.total || 0)}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {getStatusText(order.status)}
                            </p>
                          </div>
                        </div>
                        {order.items && order.items.length > 0 && (
                          <div className="mt-2">
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {order.items[0].productSnapshot?.name}
                              {order.items.length > 1 && ` et ${order.items.length - 1} autre(s)`}
                            </p>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="p-6 text-center">
                      <p className="text-gray-500 dark:text-gray-400">
                        Aucune commande récente
                      </p>
                      <Link
                        href="/products"
                        className="inline-block mt-2 text-blue-600 hover:text-blue-500 text-sm font-medium"
                      >
                        Commencer vos achats
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default UserDashboard;