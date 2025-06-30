const generateRobotsTxt = () => {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://fenkparet.com';
  
  return `User-agent: *
Allow: /

# Allow all crawlers access to public pages
Allow: /products
Allow: /products/*
Allow: /about
Allow: /contact
Allow: /nouveautes

# Disallow admin and private areas
Disallow: /admin
Disallow: /admin/*
Disallow: /user
Disallow: /user/*
Disallow: /api
Disallow: /api/*
Disallow: /auth
Disallow: /auth/*
Disallow: /cart
Disallow: /checkout

# Disallow search pages with parameters
Disallow: /*?search=*
Disallow: /*?page=*
Disallow: /*?*&search=*

# Sitemap location
Sitemap: ${baseUrl}/sitemap.xml

# Crawl delay (be respectful)
Crawl-delay: 1

# Allow common search engines with higher frequency
User-agent: Googlebot
Crawl-delay: 1

User-agent: Bingbot
Crawl-delay: 1

User-agent: Slurp
Crawl-delay: 1
`;
};

const RobotsTxt = () => {
  // This component doesn't render anything
  return null;
};

export async function getServerSideProps({ res }) {
  const robotsTxt = generateRobotsTxt();

  res.setHeader('Content-Type', 'text/plain');
  res.write(robotsTxt);
  res.end();

  return {
    props: {},
  };
}

export default RobotsTxt;