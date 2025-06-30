import axios from 'axios';

const generateSiteMap = (pages, products, categories) => {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://fenkparet.com';
  
  return `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      <!-- Static pages -->
      <url>
        <loc>${baseUrl}</loc>
        <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
        <changefreq>daily</changefreq>
        <priority>1.0</priority>
      </url>
      <url>
        <loc>${baseUrl}/products</loc>
        <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
        <changefreq>daily</changefreq>
        <priority>0.8</priority>
      </url>
      <url>
        <loc>${baseUrl}/about</loc>
        <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.6</priority>
      </url>
      <url>
        <loc>${baseUrl}/contact</loc>
        <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.6</priority>
      </url>
      <url>
        <loc>${baseUrl}/nouveautes</loc>
        <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
        <changefreq>daily</changefreq>
        <priority>0.7</priority>
      </url>
      
      <!-- Categories -->
      ${categories
        .map((category) => {
          return `
            <url>
              <loc>${baseUrl}/products/category/${category.slug}</loc>
              <lastmod>${new Date(category.updatedAt || category.createdAt).toISOString().split('T')[0]}</lastmod>
              <changefreq>weekly</changefreq>
              <priority>0.7</priority>
            </url>
          `;
        })
        .join('')}
      
      <!-- Products -->
      ${products
        .map((product) => {
          return `
            <url>
              <loc>${baseUrl}/products/${product._id}</loc>
              <lastmod>${new Date(product.updatedAt || product.createdAt).toISOString().split('T')[0]}</lastmod>
              <changefreq>weekly</changefreq>
              <priority>0.8</priority>
            </url>
          `;
        })
        .join('')}
    </urlset>
  `;
};

const SiteMap = () => {
  // This component doesn't render anything
  // It's only used to generate the sitemap
  return null;
};

export async function getServerSideProps({ res }) {
  try {
    const baseApiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    
    // Fetch all active products and categories
    const [productsResponse, categoriesResponse] = await Promise.all([
      axios.get(`${baseApiUrl}/api/products?status=active&limit=1000`),
      axios.get(`${baseApiUrl}/api/products/categories?isActive=true`)
    ]);

    const products = productsResponse.data.products || [];
    const categories = categoriesResponse.data.categories || [];

    // Generate the XML sitemap
    const sitemap = generateSiteMap([], products, categories);

    res.setHeader('Content-Type', 'text/xml');
    res.write(sitemap);
    res.end();

    return {
      props: {},
    };
  } catch (error) {
    console.error('Error generating sitemap:', error);
    
    // Generate basic sitemap on error
    const basicSitemap = generateSiteMap([], [], []);
    res.setHeader('Content-Type', 'text/xml');
    res.write(basicSitemap);
    res.end();

    return {
      props: {},
    };
  }
}

export default SiteMap;