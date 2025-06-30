import Head from 'next/head';
import { useRouter } from 'next/router';

const SEO = ({
  title,
  description,
  keywords = [],
  image,
  article = false,
  product = null,
  noindex = false,
  canonical
}) => {
  const router = useRouter();
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://fenkparet.com';
  const currentUrl = canonical || `${baseUrl}${router.asPath}`;
  
  // Default SEO values
  const defaultTitle = 'Fenkparet - Produits Haïtiens de Qualité | T-Shirts, Mugs, Accessoires';
  const defaultDescription = 'Découvrez notre collection de produits haïtiens authentiques. T-shirts personnalisés, mugs, accessoires et bien plus. Paiement sécurisé avec MonCash.';
  const defaultImage = `${baseUrl}/images/og-image.jpg`;
  
  const seoTitle = title ? `${title} | Fenkparet` : defaultTitle;
  const seoDescription = description || defaultDescription;
  const seoImage = image || defaultImage;
  const seoKeywords = [
    'Haïti',
    'produits haïtiens',
    'MonCash',
    'e-commerce',
    't-shirts',
    'mugs',
    'accessoires',
    'Fenkparet',
    ...keywords
  ].join(', ');

  // Structured data for products
  const productStructuredData = product ? {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": product.name,
    "description": product.description || product.shortDescription,
    "image": product.images?.map(img => `${baseUrl}${img.url}`) || [seoImage],
    "brand": {
      "@type": "Brand",
      "name": "Fenkparet"
    },
    "offers": {
      "@type": "Offer",
      "price": product.price,
      "priceCurrency": "HTG",
      "availability": product.inventory?.stockStatus === 'in-stock' 
        ? "https://schema.org/InStock" 
        : "https://schema.org/OutOfStock",
      "seller": {
        "@type": "Organization",
        "name": "Fenkparet"
      }
    },
    ...(product.ratings?.count > 0 && {
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": product.ratings.average,
        "reviewCount": product.ratings.count
      }
    }),
    "category": product.category?.name,
    "sku": product.sku
  } : null;

  // Organization structured data
  const organizationStructuredData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Fenkparet",
    "url": baseUrl,
    "logo": `${baseUrl}/logo.png`,
    "description": "E-commerce de produits haïtiens authentiques avec paiement MonCash",
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+509-XXXX-XXXX",
      "contactType": "customer service",
      "availableLanguage": ["French", "Creole"]
    },
    "sameAs": [
      "https://facebook.com/fenkparet",
      "https://instagram.com/fenkparet"
    ]
  };

  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{seoTitle}</title>
      <meta name="description" content={seoDescription} />
      <meta name="keywords" content={seoKeywords} />
      
      {/* Canonical URL */}
      <link rel="canonical" href={currentUrl} />
      
      {/* Robots */}
      {noindex && <meta name="robots" content="noindex,nofollow" />}
      
      {/* Open Graph */}
      <meta property="og:type" content={article ? "article" : product ? "product" : "website"} />
      <meta property="og:title" content={seoTitle} />
      <meta property="og:description" content={seoDescription} />
      <meta property="og:image" content={seoImage} />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:site_name" content="Fenkparet" />
      <meta property="og:locale" content="fr_HT" />
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={seoTitle} />
      <meta name="twitter:description" content={seoDescription} />
      <meta name="twitter:image" content={seoImage} />
      
      {/* Product specific meta tags */}
      {product && (
        <>
          <meta property="product:price:amount" content={product.price} />
          <meta property="product:price:currency" content="HTG" />
          <meta property="product:availability" content={
            product.inventory?.stockStatus === 'in-stock' ? 'instock' : 'oos'
          } />
          <meta property="product:brand" content="Fenkparet" />
          <meta property="product:category" content={product.category?.name} />
        </>
      )}
      
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationStructuredData)
        }}
      />
      
      {productStructuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(productStructuredData)
          }}
        />
      )}
    </Head>
  );
};

export default SEO;