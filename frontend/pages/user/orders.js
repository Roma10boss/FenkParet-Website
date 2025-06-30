import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { 
  ShoppingBagIcon,
  TruckIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  EyeIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../hooks/useAuth'; // Correct path
import { useTheme } from '../../context/ThemeContext'; // Correct path
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { LoadingPage } from '../../components/ui/LoadingPage'; 

export default function Orders() {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuth(); 
  const formatCurrency = (amount) => `$${amount.toFixed(2)}`;
  const formatDate = (date) => new Date(date).toLocaleDateString();
  const { mounted: themeMounted } = useTheme(); 

  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true); 
  const [filter, setFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const pageIsLoading = authLoading || loadingOrders || !themeMounted;

  useEffect(() => {
    if (themeMounted && !authLoading && !isAuthenticated) { 
      toast.error('You must be logged in to view orders.');
      router.push('/auth/login');
      return; 
    }
  }, [isAuthenticated, authLoading, themeMounted, router]); 

  useEffect(() => {
    if (user && themeMounted && !authLoading) { 
      fetchOrders();
    }
  }, [user, themeMounted, authLoading, fetchOrders]); 

  const fetchOrders = useCallback(async () => {
    try {
      setLoadingOrders(true); 
      const params = {
        page: currentPage,
        limit: 10,
        ...(filter !== 'all' && { status: filter })
      };
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/orders/my-orders`, config); 

      setOrders(response.data.orders);
      setTotalPages(response.data.pagination.pages);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load orders.');
    } finally {
      setLoadingOrders(false); 
    }
  }, [currentPage, filter]);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
      case 'payment-pending':
        return <ClockIcon className="w-5 h-5 text-warning-color" />; 
      case 'confirmed':
      case 'processing':
        return <ArrowPathIcon className="w-5 h-5 text-info-color" />; 
      case 'shipped':
        return <TruckIcon className="w-5 h-5 text-primary-color" />; 
      case 'delivered':
        return <CheckCircleIcon className="w-5 h-5 text-success-color" />; 
      case 'cancelled':
        return <XCircleIcon className="w-5 h-5 text-error-color" />; 
      default:
        return <ClockIcon className="w-5 h-5 text-theme-tertiary" />; 
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
      case 'payment-pending':
        return 'badge-warning'; 
      case 'confirmed':
      case 'processing':
        return 'badge-info'; 
      case 'shipped':
        return 'badge-primary'; 
      case 'delivered':
        return 'badge-success'; 
      case 'cancelled':
        return 'badge-danger'; 
      default:
        return 'badge-secondary'; 
    }
  };

  const filterOptions = [
    { value: 'all', label: 'All Orders' },
    { value: 'pending', label: 'Pending' },
    { value: 'payment-pending', label: 'Payment Pending' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'processing', label: 'Processing' },
    { value: 'shipped', label: 'Shipped' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  if (pageIsLoading) {
    return <LoadingPage message="Loading your orders..." />;
  }

  if (!user) {
    return null; 
  }

  return (
    <>
      <Head>
        <title>My Orders | Fenkparet</title>
        <meta name="description" content="View your order history and track your purchases from Fenkparet." />
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <div className="min-h-screen bg-theme-primary py-8 theme-transition"> 
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-theme-primary"> 
              Order History
            </h1>
            <p className="text-theme-secondary mt-2"> 
              Track and manage your orders
            </p>
          </div>

          <div className="mb-6">
            <div className="flex flex-wrap gap-2">
              {filterOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    setFilter(option.value);
                    setCurrentPage(1);
                  }}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    filter === option.value
                      ? 'bg-accent text-accent-contrast' 
                      : 'bg-theme-tertiary text-theme-secondary border border-theme hover:bg-theme-secondary hover:text-theme-primary' 
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            {loadingOrders ? (
              <div className="text-center py-12">
                <div className="spinner w-8 h-8 text-accent mx-auto"></div> 
                <p className="text-theme-secondary mt-4">Loading orders...</p> 
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-12 card"> 
                <ShoppingBagIcon className="w-16 h-16 text-theme-tertiary mx-auto mb-4" /> 
                <h3 className="text-lg font-medium text-theme-primary mb-2"> 
                  No Orders Found
                </h3>
                <p className="text-theme-secondary mb-6"> 
                  You haven&apos;t placed any orders yet.
                </p>
                <Link href="/products" className="btn-primary"> 
                  Start Shopping
                </Link>
              </div>
            ) : (
              orders.map((order) => (
                <div key={order._id} className="card"> 
                  <div className="card-body">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4 mb-4">
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(order.status)}
                            <span className="font-medium text-theme-primary"> 
                              #{order.orderNumber}
                            </span>
                          </div>
                          <span className={`badge ${getStatusColor(order.status)}`}>
                            {t(`order.status.${order.status}`) || order.status} 
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <div>
                            <p className="text-sm text-theme-secondary"> 
                              {'order.orderDate' || 'Order Date'}
                            </p>
                            <p className="font-medium text-theme-primary"> 
                              {formatDate(order.createdAt)}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-theme-secondary"> 
                              {'order.orderTotal' || 'Order Total'}
                            </p>
                            <p className="font-medium text-theme-primary"> 
                              {formatCurrency(order.pricing.total)}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-theme-secondary"> 
                              {'order.itemsCount' || 'Items'}
                            </p>
                            <p className="font-medium text-theme-primary"> 
                              {order.items.length} {order.items.length === 1 ? 'common.item' || 'item' : 'common.items' || 'items'}
                            </p>
                          </div>
                        </div>

                        <div className="border-t border-theme pt-4"> 
                          <div className="space-y-2">
                            {order.items.slice(0, 2).map((item, index) => (
                              <div key={index} className="flex items-center space-x-3">
                                <div className="w-12 h-12 bg-theme-secondary rounded-md flex items-center justify-center"> 
                                  {item.product?.images?.[0]?.url ? (
                                    <Image
                                      src={item.product.images[0].url}
                                      alt={item.product.name}
                                      width={48}
                                      height={48}
                                      className="w-full h-full object-cover rounded-md"
                                    />
                                  ) : (
                                    <ShoppingBagIcon className="w-6 h-6 text-theme-tertiary" /> 
                                  )}
                                </div>
                                <div className="flex-1">
                                  <p className="text-sm font-medium text-theme-primary"> 
                                    {item.product?.name || 'common.product' || 'Product'}
                                  </p>
                                  <p className="text-sm text-theme-secondary"> 
                                    Qty: {item.quantity} × {formatCurrency(item.price)}
                                  </p>
                                </div>
                              </div>
                            ))}
                            {order.items.length > 2 && (
                              <p className="text-sm text-theme-secondary"> 
                                +{order.items.length - 2} {'order.moreItems' || 'more items'}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-3 mt-6 lg:mt-0 lg:ml-6">
                        <Link
                          href={`/orders/${order._id}`}
                          className="btn-outline btn-sm inline-flex items-center" 
                        >
                          <EyeIcon className="w-4 h-4 mr-2" />
                          {'order.orderDetails' || 'Order Details'}
                        </Link>
                        
                        {order.status === 'shipped' && order.trackingNumber && (
                          <button
                            onClick={() => {
                              window.open(`/track/${order.trackingNumber}`, '_blank');
                            }}
                            className="btn-primary btn-sm inline-flex items-center" 
                          >
                            <TruckIcon className="w-4 h-4 mr-2" />
                            {'order.trackOrder' || 'Track Order'}
                          </button>
                        )}

                        {order.status === 'delivered' && (
                          <Link
                            href={`/products/${order.items[0]?.product?._id}?review=true`}
                            className="btn-secondary btn-sm" 
                          >
                            {'order.writeReview' || 'Write Review'}
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {totalPages > 1 && (
            <div className="mt-8 flex justify-center">
              <div className="pagination">
                <button
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="pagination-item"
                >
                  {'common.previous' || 'Previous'}
                </button>
                
                {[...Array(totalPages)].map((_, index) => (
                  <button
                    key={index + 1}
                    onClick={() => setCurrentPage(index + 1)}
                    className={`pagination-item ${
                      currentPage === index + 1 ? 'active' : ''
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
                
                <button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="pagination-item"
                >
                  {'common.next' || 'Next'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
