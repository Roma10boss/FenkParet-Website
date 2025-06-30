import { useState, useEffect } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import AdminLayout from '../../components/admin/AdminLayout';
import { useAuth } from '../../hooks/useAuth';
import { useRouter } from 'next/router';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import {
  ExclamationTriangleIcon,
  PencilIcon,
  EyeIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ChartBarIcon,
  InboxStackIcon
} from '@heroicons/react/24/outline';

const InventoryManagement = () => {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [stats, setStats] = useState({
    totalProducts: 0,
    lowStockProducts: 0,
    outOfStockProducts: 0,
    totalValue: 0
  });
  const [filters, setFilters] = useState({
    category: '',
    stockStatus: 'all',
    search: ''
  });
  const [editingProduct, setEditingProduct] = useState(null);
  const [bulkUpdateMode, setBulkUpdateMode] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState([]);

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated || !user?.isAdmin) {
        router.push('/');
        return;
      }
      fetchInventoryData();
    }
  }, [isAuthenticated, authLoading, user, router, filters]);

  const fetchInventoryData = async () => {
    try {
      setLoading(true);
      
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          ...filters,
          limit: 100 // Get more products for inventory management
        }
      };

      // Fetch products and inventory alerts
      const [productsResponse, alertsResponse] = await Promise.all([
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/products`, config),
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/inventory/alerts`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);
      
      setProducts(productsResponse.data.products || []);
      
      // Calculate stats
      const totalProducts = productsResponse.data.products?.length || 0;
      const lowStockProducts = productsResponse.data.products?.filter(p => 
        p.inventory?.stockStatus === 'low-stock'
      ).length || 0;
      const outOfStockProducts = productsResponse.data.products?.filter(p => 
        p.inventory?.stockStatus === 'out-of-stock'
      ).length || 0;
      const totalValue = productsResponse.data.products?.reduce((sum, p) => 
        sum + (p.price * (p.inventory?.quantity || 0)), 0
      ) || 0;

      setStats({
        totalProducts,
        lowStockProducts,
        outOfStockProducts,
        totalValue
      });
      
    } catch (error) {
      console.error('Error fetching inventory data:', error);
      toast.error('Erreur lors du chargement des données d\'inventaire');
      
      // Mock data for fallback
      const mockProducts = [
        {
          _id: '1',
          name: 'Premium T-Shirt',
          price: 250,
          sku: 'TSH-001',
          category: { name: 'T-Shirts' },
          inventory: {
            quantity: 25,
            lowStockThreshold: 10,
            stockStatus: 'in-stock',
            trackQuantity: true
          },
          images: [{ url: '/placeholder.jpg' }]
        },
        {
          _id: '2',
          name: 'Custom Mug',
          price: 120,
          sku: 'MUG-001',
          category: { name: 'Mugs' },
          inventory: {
            quantity: 3,
            lowStockThreshold: 5,
            stockStatus: 'low-stock',
            trackQuantity: true
          },
          images: [{ url: '/placeholder.jpg' }]
        }
      ];
      setProducts(mockProducts);
      setStats({ totalProducts: 2, lowStockProducts: 1, outOfStockProducts: 0, totalValue: 6610 });
    } finally {
      setLoading(false);
    }
  };

  const updateProductInventory = async (productId, updates) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/products/${productId}/inventory`,
        updates,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success('Inventaire mis à jour avec succès');
      fetchInventoryData();
      setEditingProduct(null);
    } catch (error) {
      toast.error('Erreur lors de la mise à jour de l\'inventaire');
    }
  };

  const bulkUpdateInventory = async (updates) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/inventory/bulk-update`,
        { updates },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success(`${updates.length} produits mis à jour avec succès`);
      fetchInventoryData();
      setBulkUpdateMode(false);
      setSelectedProducts([]);
    } catch (error) {
      toast.error('Erreur lors de la mise à jour en lot');
    }
  };

  const getStockStatusColor = (status) => {
    switch (status) {
      case 'in-stock':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'low-stock':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'out-of-stock':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getStockStatusText = (status) => {
    const statusMap = {
      'in-stock': 'En stock',
      'low-stock': 'Stock faible',
      'out-of-stock': 'Rupture',
      'backorder': 'Commande en cours'
    };
    return statusMap[status] || status;
  };

  const formatCurrency = (amount) => `${amount.toFixed(2)} HTG`;

  const InventoryEditModal = ({ product, onClose, onSave }) => {
    const [formData, setFormData] = useState({
      quantity: product.inventory?.quantity || 0,
      lowStockThreshold: product.inventory?.lowStockThreshold || 5,
      trackQuantity: product.inventory?.trackQuantity !== false
    });

    const handleSave = () => {
      onSave(product._id, formData);
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Modifier l&apos;inventaire - {product.name}
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Quantité en stock
              </label>
              <input
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData(prev => ({ ...prev, quantity: parseInt(e.target.value) || 0 }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 text-gray-900 dark:text-white"
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Seuil de stock faible
              </label>
              <input
                type="number"
                value={formData.lowStockThreshold}
                onChange={(e) => setFormData(prev => ({ ...prev, lowStockThreshold: parseInt(e.target.value) || 0 }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 text-gray-900 dark:text-white"
                min="0"
              />
            </div>

            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.trackQuantity}
                  onChange={(e) => setFormData(prev => ({ ...prev, trackQuantity: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  Suivre la quantité
                </span>
              </label>
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white"
            >
              Annuler
            </button>
            <button
              onClick={handleSave}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Sauvegarder
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (authLoading || loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <>
      <Head>
        <title>Gestion d&apos;Inventaire - Admin Fenkparet</title>
        <meta name="description" content="Gérez l'inventaire et les stocks des produits" />
      </Head>

      <AdminLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Gestion d&apos;Inventaire
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Surveillez et gérez les stocks de vos produits
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setBulkUpdateMode(!bulkUpdateMode)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  bulkUpdateMode
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {bulkUpdateMode ? 'Annuler' : 'Mise à jour en lot'}
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <InboxStackIcon className="h-8 w-8 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Total Produits
                  </p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                    {stats.totalProducts}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ExclamationTriangleIcon className="h-8 w-8 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Stock Faible
                  </p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                    {stats.lowStockProducts}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ArrowDownIcon className="h-8 w-8 text-red-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Rupture
                  </p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                    {stats.outOfStockProducts}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ChartBarIcon className="h-8 w-8 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Valeur Totale
                  </p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                    {formatCurrency(stats.totalValue)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input
                type="text"
                placeholder="Rechercher par nom ou SKU..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              
              <select
                value={filters.stockStatus}
                onChange={(e) => setFilters(prev => ({ ...prev, stockStatus: e.target.value }))}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="all">Tous les statuts</option>
                <option value="in-stock">En stock</option>
                <option value="low-stock">Stock faible</option>
                <option value="out-of-stock">Rupture</option>
              </select>

              <select
                value={filters.category}
                onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">Toutes les catégories</option>
                <option value="t-shirts">T-Shirts</option>
                <option value="mugs">Mugs</option>
                <option value="keychains">Keychains</option>
                <option value="phone-cases">Phone Cases</option>
                <option value="hoodies">Hoodies</option>
              </select>
            </div>
          </div>

          {/* Products Table */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    {bulkUpdateMode && (
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        <input
                          type="checkbox"
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedProducts(products.map(p => p._id));
                            } else {
                              setSelectedProducts([]);
                            }
                          }}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                      </th>
                    )}
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Produit
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      SKU
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Prix
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Stock
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Valeur
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {products.map((product) => (
                    <tr key={product._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      {bulkUpdateMode && (
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={selectedProducts.includes(product._id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedProducts(prev => [...prev, product._id]);
                              } else {
                                setSelectedProducts(prev => prev.filter(id => id !== product._id));
                              }
                            }}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                        </td>
                      )}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <Image
                              className="h-10 w-10 rounded-lg object-cover"
                              src={product.images?.[0]?.url || '/placeholder.jpg'}
                              alt={product.name}
                              width={40}
                              height={40}
                            />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {product.name}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {product.category?.name}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {product.sku || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {formatCurrency(product.price)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {product.inventory?.quantity || 0}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Seuil: {product.inventory?.lowStockThreshold || 5}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          getStockStatusColor(product.inventory?.stockStatus)
                        }`}>
                          {getStockStatusText(product.inventory?.stockStatus)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {formatCurrency(product.price * (product.inventory?.quantity || 0))}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button
                          onClick={() => setEditingProduct(product)}
                          className="text-blue-600 hover:text-blue-900 dark:hover:text-blue-400"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button className="text-gray-600 hover:text-gray-900 dark:hover:text-gray-400">
                          <EyeIcon className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Bulk Update Panel */}
          {bulkUpdateMode && selectedProducts.length > 0 && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <span className="text-blue-700 dark:text-blue-300">
                  {selectedProducts.length} produit(s) sélectionné(s)
                </span>
                <div className="space-x-2">
                  <button
                    onClick={() => {
                      // Implement bulk update logic
                      const updates = selectedProducts.map(productId => ({
                        productId,
                        quantity: 100 // Example: set all to 100
                      }));
                      bulkUpdateInventory(updates);
                    }}
                    className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                  >
                    Réapprovisionner
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Edit Modal */}
          {editingProduct && (
            <InventoryEditModal
              product={editingProduct}
              onClose={() => setEditingProduct(null)}
              onSave={updateProductInventory}
            />
          )}
        </div>
      </AdminLayout>
    </>
  );
};

export default InventoryManagement;