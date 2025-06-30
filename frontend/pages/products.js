import { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';
import ProductGrid from '../components/product/ProductGrid';
import ProductFilters from '../components/product/ProductFilters';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    category: '',
    minPrice: '',
    maxPrice: '',
    search: '',
    sortBy: 'name',
    sortOrder: 'asc'
  });

  useEffect(() => {
    fetchProducts();
  }, [filters, fetchProducts]);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Build query parameters
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== '') {
          queryParams.append(key, value);
        }
      });

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products?${queryParams}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      
      const data = await response.json();
      setProducts(data.products || []);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError(err.message);
      
      // Fallback to mock data if API fails
      const mockProducts = [
        {
          _id: '1',
          name: 'Premium T-Shirt',
          price: 250,
          comparePrice: 300,
          images: [{ url: 'https://placehold.co/400x300/e8f2e8/1f2937?text=T-Shirt', alt: 'Premium T-Shirt' }],
          inventory: { stockStatus: 'in-stock' },
          category: { name: 'T-Shirts', slug: 't-shirts' },
          featured: true
        },
        {
          _id: '2',
          name: 'Coffee Mug',
          price: 150,
          images: [{ url: 'https://placehold.co/400x300/f0f7f0/1f2937?text=Coffee+Mug', alt: 'Coffee Mug' }],
          inventory: { stockStatus: 'in-stock' },
          category: { name: 'Mugs', slug: 'mugs' }
        }
      ];
      setProducts(mockProducts);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Erreur</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <button 
            onClick={fetchProducts}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Produits - {process.env.NEXT_PUBLIC_SITE_NAME}</title>
        <meta name="description" content="Parcourez notre collection complète de produits" />
      </Head>
      
      <div className="container mx-auto px-4 py-8">

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Filters Sidebar */}
            <div className="lg:w-1/4">
              <ProductFilters 
                filters={filters} 
                onFilterChange={handleFilterChange}
              />
            </div>

            {/* Products Grid */}
            <div className="lg:w-3/4">
              {/* Results Summary */}
              <div className="mb-6 flex justify-between items-center">
                <p className="text-gray-600 dark:text-gray-400">
                  {products.length} produits trouvés
                </p>
                
                {/* Sort Options */}
                <div className="flex items-center space-x-4">
                  <label className="text-sm text-gray-600 dark:text-gray-400">
                    Trier par:
                  </label>
                  <select 
                    value={`${filters.sortBy}-${filters.sortOrder}`}
                    onChange={(e) => {
                      const [sortBy, sortOrder] = e.target.value.split('-');
                      handleFilterChange({ sortBy, sortOrder });
                    }}
                    className="border border-gray-300 dark:border-gray-600 rounded px-3 py-1 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  >
                    <option value="name-asc">Nom A-Z</option>
                    <option value="name-desc">Nom Z-A</option>
                    <option value="price-asc">Prix croissant</option>
                    <option value="price-desc">Prix décroissant</option>
                    <option value="createdAt-desc">Plus récents</option>
                  </select>
                </div>
              </div>

              {/* Products Grid */}
              <ProductGrid products={products} />
              
              {products.length === 0 && (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🛍️</div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    Aucun produit trouvé
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Essayez d&apos;ajuster vos filtres ou termes de recherche
                  </p>
                  <button 
                    onClick={() => setFilters({
                      category: '',
                      minPrice: '',
                      maxPrice: '',
                      search: '',
                      sortBy: 'name',
                      sortOrder: 'asc'
                    })}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                  >
                    Effacer les filtres
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
    </>
  );
};

export default ProductsPage;