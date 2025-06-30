import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { GetServerSideProps } from 'next';
import axios from 'axios';
import Layout from '../../components/layout/Layout';
import SEO from '../../components/SEO';
import ProductDetails from '../../components/product/ProductDetails';
import ProductReviews from '../../components/product/ProductReviews';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const ProductDetailPage = ({ product: initialProduct, error }) => {
  const router = useRouter();
  const [product, setProduct] = useState(initialProduct);
  const [loading, setLoading] = useState(!initialProduct && !error);

  useEffect(() => {
    if (!initialProduct && !error) {
      fetchProduct();
    }
  }, [router.query.id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/products/${router.query.id}`
      );
      setProduct(response.data.product);
    } catch (error) {
      console.error('Error fetching product:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-[400px]">
          <LoadingSpinner />
        </div>
      </Layout>
    );
  }

  if (error || !product) {
    return (
      <Layout>
        <SEO 
          title="Produit non trouvé"
          description="Le produit demandé n'existe pas ou n'est plus disponible."
          noindex={true}
        />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Produit non trouvé
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              Le produit que vous recherchez n&apos;existe pas ou n&apos;est plus disponible.
            </p>
            <button
              onClick={() => router.push('/products')}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Voir tous les produits
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  // Generate SEO data
  const seoTitle = `${product.name} - ${product.category?.name || 'Produits'}`;
  const seoDescription = product.shortDescription || product.description?.substring(0, 160) || 
    `Découvrez ${product.name} sur Fenkparet. Prix: ${product.price} HTG. ${product.category?.name ? `Catégorie: ${product.category.name}.` : ''} Livraison en Haïti.`;
  
  const productImage = product.images?.length > 0 
    ? `${process.env.NEXT_PUBLIC_SITE_URL || 'https://fenkparet.com'}${product.images[0].url}`
    : null;

  const breadcrumbStructuredData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Accueil",
        "item": process.env.NEXT_PUBLIC_SITE_URL || 'https://fenkparet.com'
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Produits",
        "item": `${process.env.NEXT_PUBLIC_SITE_URL || 'https://fenkparet.com'}/products`
      },
      ...(product.category ? [{
        "@type": "ListItem",
        "position": 3,
        "name": product.category.name,
        "item": `${process.env.NEXT_PUBLIC_SITE_URL || 'https://fenkparet.com'}/products/category/${product.category.slug}`
      }] : []),
      {
        "@type": "ListItem",
        "position": product.category ? 4 : 3,
        "name": product.name,
        "item": `${process.env.NEXT_PUBLIC_SITE_URL || 'https://fenkparet.com'}/products/${product._id}`
      }
    ]
  };

  return (
    <Layout>
      <SEO
        title={seoTitle}
        description={seoDescription}
        keywords={[
          product.name,
          product.category?.name,
          ...(product.tags || []),
          'produit haïtien',
          'MonCash',
          'livraison Haïti'
        ]}
        image={productImage}
        product={product}
      />
      
      {/* Breadcrumb Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbStructuredData)
        }}
      />

      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb Navigation */}
        <nav className="flex mb-8" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-3">
            <li className="inline-flex items-center">
              <button
                onClick={() => router.push('/')}
                className="text-gray-700 hover:text-blue-600 dark:text-gray-400 dark:hover:text-white"
              >
                Accueil
              </button>
            </li>
            <li>
              <div className="flex items-center">
                <span className="mx-2 text-gray-400">/</span>
                <button
                  onClick={() => router.push('/products')}
                  className="text-gray-700 hover:text-blue-600 dark:text-gray-400 dark:hover:text-white"
                >
                  Produits
                </button>
              </div>
            </li>
            {product.category && (
              <li>
                <div className="flex items-center">
                  <span className="mx-2 text-gray-400">/</span>
                  <button
                    onClick={() => router.push(`/products/category/${product.category.slug}`)}
                    className="text-gray-700 hover:text-blue-600 dark:text-gray-400 dark:hover:text-white"
                  >
                    {product.category.name}
                  </button>
                </div>
              </li>
            )}
            <li>
              <div className="flex items-center">
                <span className="mx-2 text-gray-400">/</span>
                <span className="text-gray-500 dark:text-gray-400">
                  {product.name}
                </span>
              </div>
            </li>
          </ol>
        </nav>

        {/* Product Details */}
        <ProductDetails product={product} />

        {/* Product Reviews */}
        <div className="mt-12">
          <ProductReviews productId={product._id} />
        </div>
      </div>
    </Layout>
  );
};

export async function getServerSideProps({ params, req }) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    const productResponse = await axios.get(`${baseUrl}/api/products/${params.id}`);
    
    return {
      props: {
        product: productResponse.data.product
      }
    };
  } catch (error) {
    console.error('Error fetching product:', error);
    
    return {
      props: {
        product: null,
        error: 'Product not found'
      }
    };
  }
}

export default ProductDetailPage;