import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
// CORRECTED: Import useRouter from 'next/router'
import { useRouter } from 'next/router';
import SEO from '../components/SEO'; 

import { toast } from 'react-hot-toast'; 
import api from '../utils/api'; 

import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext'; 
import { useAuth } from '../hooks/useAuth'; 
import { LoadingPage } from '../components/ui/LoadingPage'; 
import Button from '../components/ui/Button'; 

import {
  ShoppingCartIcon,
  SparklesIcon, 
  TruckIcon,
  ShieldCheckIcon,
  StarIcon,
  ArrowRightIcon,
  ShoppingBagIcon
} from '@heroicons/react/24/outline'; 

// --- Helper Components (Defined outside the main Home component) ---

// Product Card Component
const ProductCard = ({ product, onAddToCart, showNewBadge = false }) => {
  const formatCurrency = (amount) => `${amount.toFixed(2)} HTG`;
  const router = useRouter(); 

  const handleProductClick = () => {
    router.push(`/products/${product._id}`);
  };

  const handleAddToCartClick = (e) => {
    e.stopPropagation(); 
    onAddToCart(product);
  };

  const discountPercentage = product.comparePrice && product.comparePrice > product.price
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
    : 0;

  return (
    <div 
      className="product-card group cursor-pointer card transform transition-transform duration-300 hover:scale-[1.02] focus-within:scale-[1.02]" 
      onClick={handleProductClick} 
      role="link"
      tabIndex={0}
      onKeyPress={(e) => { if (e.key === 'Enter') handleProductClick(); }}
    >
      <div className="relative w-full h-48 sm:h-56 bg-theme-secondary flex items-center justify-center overflow-hidden rounded-t-lg">
        {product.images && product.images.length > 0 && product.images[0].url ? (
          <Image
            src={product.images[0].url}
            alt={product.images[0].alt || product.name}
            layout="fill"
            objectFit="cover"
            className="group-hover:scale-105 transition-transform duration-300"
            onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/400x300/e0e0e0/505050?text=No+Image"; }}
          />
        ) : (
          <ShoppingBagIcon className="h-16 w-16 text-theme-tertiary" />
        )}

        <div className="absolute top-3 left-3 space-y-2 z-10">
          {showNewBadge && (
            <span className="badge badge-success">
              NEW
            </span>
          )}
          {discountPercentage > 0 && (
            <span className="badge badge-error">
              -{discountPercentage}%
            </span>
          )}
          {product.featured && (
            <span className="badge bg-info-light text-info-color">
              FEATURED
            </span>
          )}
        </div>

        {product.inventory?.stockStatus === 'low-stock' && (
          <div className="absolute bottom-3 right-3 z-10">
            <span className="badge bg-warning-light text-warning-color">
              Stock faible
            </span>
          </div>
        )}
      </div>

      <div className="p-4 flex flex-col flex-grow">
        <h3 className="font-semibold text-lg text-theme-primary mb-2 group-hover:text-accent transition-colors line-clamp-2">
          {product.name}
        </h3>

        <div className="flex items-baseline space-x-2 mb-3">
          <span className="text-xl font-bold text-theme-primary">
            {formatCurrency(product.price)}
          </span>
          {product.comparePrice && product.comparePrice > product.price && (
            <span className="text-sm text-theme-secondary line-through">
              {formatCurrency(product.comparePrice)}
            </span>
          )}
        </div>

        <div className="flex items-center mb-4">
          {[...Array(5)].map((_, i) => (
            <StarIcon
              key={i}
              className={`h-5 w-5 ${i < (product.averageRating || product.rating || 0) ? 'text-yellow-400 fill-current' : 'text-theme-tertiary'}`} 
            />
          ))}
          <span className="text-sm text-theme-secondary ml-2">
            ({product.reviewCount || 0} avis)
          </span>
        </div>

        <Button 
          onClick={handleAddToCartClick} 
          variant="primary" 
          className="w-full mt-auto"
          disabled={product.inventory?.stockStatus === 'out-of-stock'}
          icon={ShoppingCartIcon} 
          iconPosition="left"
        >
          {product.inventory?.stockStatus === 'out-of-stock'
            ? 'Rupture de stock' 
            : 'Ajouter au panier' 
          }
        </Button>
      </div>
    </div>
  );
};

// Category Card Component (from previous iteration)
const CategoryCard = ({ category }) => {
  const router = useRouter(); 

  const handleCategoryClick = () => {
    router.push(`/products/category/${category.slug}`);
  };

  return (
    <div 
      className="card flex flex-col items-center justify-center p-6 bg-theme-secondary rounded-lg shadow-md cursor-pointer hover:shadow-lg transition-shadow duration-300 transform hover:scale-[1.02]"
      onClick={handleCategoryClick}
      role="link"
      tabIndex={0}
      onKeyPress={(e) => { if (e.key === 'Enter') handleCategoryClick(); }}
    >
      <div className="w-20 h-20 bg-theme-tertiary rounded-full flex items-center justify-center mb-4">
        {category.iconUrl ? (
          <Image src={category.iconUrl} alt={category.name} width={48} height={48} className="w-12 h-12 object-contain" />
        ) : (
          // REMOVED COMMENT: The syntax error was caused by the comment directly after the string literal.
          <SparklesIcon className="w-12 h-12 text-accent" /> 
        )}
      </div>
      <h3 className="text-lg font-semibold text-theme-primary text-center">
        {category.name}
      </h3>
      <p className="text-sm text-theme-secondary text-center">
        ({category.productCount || 0} produits)
      </p>
    </div>
  );
};

// --- Main Index Page Component ---
export default function Home() {
  const { addToCart } = useCart();
  const { mounted: themeMounted } = useTheme();
  const { loading: authLoading } = useAuth();
  const formatCurrency = (amount) => `${amount.toFixed(2)} HTG`; 

  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [loadingData, setLoadingData] = useState(true); 

  const [categories, setCategories] = useState([]); // State for categories

  useEffect(() => {
    if (themeMounted && !authLoading) { 
      const fetchData = async () => {
        setLoadingData(true);
        try {
          // Fetch featured products from API
          const featuredResponse = await api.get('/products/featured?limit=4');
          const featuredData = featuredResponse.data.products || [];

          // Fetch new arrivals from API  
          const newArrivalsResponse = await api.get('/products/new-arrivals?limit=2');
          const newArrivalsData = newArrivalsResponse.data.products || [];

          // Fetch categories from API
          const categoriesResponse = await api.get('/admin/categories');
          const categoriesData = categoriesResponse.data.categories || [];
          
          setFeaturedProducts(featuredData);
          setNewArrivals(newArrivalsData);
          setCategories(categoriesData);
          
          // Only show success message if we actually got data
          if (featuredData.length > 0 || newArrivalsData.length > 0 || categoriesData.length > 0) {
            console.log('✅ Data loaded successfully from server');
          } else {
            // Server responded but no data available - use fallback without showing error
            console.log('⚠️ Server responded but no data available, using fallback data');
            useFallbackData();
          }
          
        } catch (error) {
          console.error('Error fetching data:', error);
          
          // Only show error toast for actual network/server errors
          if (error.response?.status === 429) {
            toast.error('Trop de requêtes. Utilisation des données en cache.');
          } else if (error.code === 'NETWORK_ERROR' || !navigator.onLine) {
            toast.error('Pas de connexion internet. Utilisation des données hors ligne.');
          } else if (error.response?.status >= 500) {
            toast.error('Serveur temporairement indisponible. Utilisation des données en cache.');
          } else {
            // For other errors (like 404, empty responses), don't show error toast
            console.log('API returned no data, using fallback silently');
          }
          
          useFallbackData();
        } finally {
          setLoadingData(false);
        }
      };

      const useFallbackData = () => {
        // Fallback to mock data if API fails
        const mockFeatured = [
          {
            _id: '1', name: 'Premium T-Shirt', price: 250, comparePrice: 300,
            images: [{ url: 'https://placehold.co/400x300/e8f2e8/1f2937?text=T-Shirt', alt: 'Premium T-Shirt' }],
            inventory: { stockStatus: 'in-stock', quantity: 50 }, featured: true, rating: 4, reviewCount: 24, averageRating: 4.5
          },
          {
            _id: '2', name: 'Coffee Mug', price: 150,
            images: [{ url: 'https://placehold.co/400x300/f0f7f0/1f2937?text=Coffee+Mug', alt: 'Coffee Mug' }],
            inventory: { stockStatus: 'in-stock', quantity: 30 }, featured: true, rating: 4, reviewCount: 15, averageRating: 4.2
          }
        ];

        const mockCategories = [
          { _id: 'cat1', name: 'T-Shirts', slug: 't-shirts', productCount: 25 },
          { _id: 'cat2', name: 'Mugs', slug: 'mugs', productCount: 30 },
          { _id: 'cat3', name: 'Keychains', slug: 'keychains', productCount: 15 },
          { _id: 'cat4', name: 'Phone Cases', slug: 'phone-cases', productCount: 20 }
        ];
        
        setFeaturedProducts(mockFeatured);
        setNewArrivals([]);
        setCategories(mockCategories);
      };

      fetchData();
    }
  }, [themeMounted, authLoading]); 

  const handleAddToCart = (product) => {
    addToCart(product, 1); 
    toast.success(`${product.name} ajouté au panier!`);
  };

  const features = [
    {
      icon: TruckIcon,
      title: 'Livraison gratuite',
      description: 'Livraison gratuite pour les commandes de plus de 10000 HTG'
    },
    {
      icon: ShieldCheckIcon,
      title: 'Paiement sécurisé',
      description: 'Paiement sûrs et sécurisés avec vérification administrative pour votre tranquillité.'
    },
    {
      icon: StarIcon, 
      title: 'Produits de qualité',
      description: 'Articles de qualité supérieure à des prix avantageux'
    }
  ];

  if (!themeMounted || authLoading || loadingData) {
    return <LoadingPage message="Chargement de l'application..." />;
  }

  return (
    <>
      <SEO
        title="Bienvenue chez Fenkparet"
        description="Votre marketplace de confiance pour des produits haïtiens de qualité. T-shirts personnalisés, mugs, accessoires et bien plus. Paiement sécurisé avec MonCash et livraison en Haïti."
        keywords={[
          'marketplace haïtien',
          'produits de qualité',
          'MonCash',
          'livraison Haïti',
          't-shirts personnalisés',
          'mugs',
          'accessoires',
          'e-commerce Haïti'
        ]}
      />

      {/* Hero Section */}
      <section className="relative w-full h-[500px] bg-theme-primary flex items-center justify-center overflow-hidden mb-12">
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-10">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-accent-light rounded-full mix-blend-multiply opacity-50 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-accent rounded-full mix-blend-multiply opacity-50 animate-blob animation-delay-2000"></div>
          <div className="absolute top-1/4 left-1/2 w-72 h-72 bg-accent-dark rounded-full mix-blend-multiply opacity-50 animate-blob animation-delay-4000"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h1 className="text-4xl md:text-6xl font-extrabold text-theme-primary leading-tight mb-6 animate-fade-in-up">
            Bienvenue chez{' '}
            <span className="text-gradient"> 
              Fenkparet
            </span>
          </h1>
          <p className="text-lg md:text-xl text-theme-secondary mb-10 max-w-3xl mx-auto animate-fade-in-up delay-200">
            Votre marketplace de confiance pour des produits de qualité. Découvrez des produits exceptionnels à des prix abordables à travers Haïti.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up delay-400">
            <Link
              href="/products"
              className="btn-primary inline-flex items-center group text-lg px-8 py-4" 
            >
              Découvrir les produits
              <ArrowRightIcon className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/about"
              className="btn-secondary inline-flex items-center group text-lg px-8 py-4" 
            >
              À propos
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24 bg-theme-secondary"> 
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="card p-8 text-center" 
              >
                <div className="feature-icon mx-auto mb-4"> 
                  <feature.icon className="w-8 h-8 text-accent" /> 
                </div>
                <h3 className="text-xl font-semibold text-theme-primary mb-2"> 
                  {feature.title}
                </h3>
                <p className="text-theme-secondary"> 
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Categories Section */}
      <section className="py-16 md:py-24 bg-theme-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-theme-primary mb-4">
              Explorez nos catégories
            </h2>
            <p className="text-lg text-theme-secondary max-w-2xl mx-auto">
              Trouvez exactement ce que vous cherchez dans notre large gamme de catégories de produits.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
            {categories.map((category) => (
              <CategoryCard key={category._id} category={category} />
            ))}
          </div>
          <div className="text-center mt-12">
            <Link
              href="/products" 
              className="btn-secondary inline-flex items-center group" 
            >
              Toutes les catégories
              <ArrowRightIcon className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </section>


      {/* Featured Products */}
      <section className="py-16 md:py-24 bg-theme-tertiary"> 
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-theme-primary mb-4"> 
              Produits en vedette 
            </h2>
            <p className="text-lg text-theme-secondary max-w-2xl mx-auto"> 
              Découvrez nos produits les plus populaires, soigneusement sélectionnés pour leur qualité et leur valeur.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {featuredProducts.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                onAddToCart={() => handleAddToCart(product)}
              />
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              href="/products?featured=true"
              className="btn-primary inline-flex items-center group" 
            >
              Voir tout en vedette 
              <ArrowRightIcon className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </section>

      {/* New Arrivals */}
      {newArrivals.length > 0 && (
        <section className="py-16 md:py-24 bg-theme-primary"> 
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-theme-primary mb-4"> 
                Nouveautés 
              </h2>
              <p className="text-lg text-theme-secondary max-w-2xl mx-auto"> 
                Nouveaux arrivages rien que pour vous. Soyez les premiers à obtenir ces nouveaux produits incroyables.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {newArrivals.map((product) => (
                <ProductCard
                  key={product._id}
                  product={product}
                  onAddToCart={() => handleAddToCart(product)}
                  showNewBadge={true}
                />
              ))}
            </div>

            <div className="text-center mt-12">
              <Link
                href="/products"
                className="btn-secondary inline-flex items-center group" 
              >
                Voir tous les produits 
                <ArrowRightIcon className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-accent text-accent-contrast"> 
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Fenkparet
          </h2>
          <p className="text-accent-contrast opacity-90 mb-8 max-w-2xl mx-auto text-lg"> 
            Votre marketplace de confiance pour des produits haïtiens de qualité
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/products"
              className="btn px-8 py-4 bg-theme-primary text-accent hover:bg-theme-secondary transition-colors shadow-lg hover:shadow-xl" 
            >
              Commencer les achats 
            </Link>
            <Link
              href="/contact"
              className="btn px-8 py-4 border-2 border-accent-contrast text-accent-contrast hover:bg-accent-light hover:text-accent transition-colors shadow-lg hover:shadow-xl" 
            >
              Contact 
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
