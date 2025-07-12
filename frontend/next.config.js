/** @type {import('next').NextConfig} */
const isDev = process.env.NODE_ENV === 'development';
const isStatic = !isDev && process.env.STATIC_EXPORT === 'true'; // Only enable static export for production builds

const nextConfig = {
  // Only use static export for production builds when specified
  ...(isStatic && { 
    output: 'export', 
    trailingSlash: true,
    // Exclude API routes from static export
    exportPathMap: async function (defaultPathMap) {
      const pathMap = {};
      Object.keys(defaultPathMap).forEach(key => {
        if (!key.startsWith('/api')) {
          pathMap[key] = defaultPathMap[key];
        }
      });
      return pathMap;
    }
  }),
  reactStrictMode: true,
  
  // Fast Refresh is enabled by default in Next.js 14

  // Image optimization configuration
  images: {
    unoptimized: isStatic, // Only disable for static export
    // Use 'remotePatterns' instead of 'domains' (deprecated)
    remotePatterns: [
      {
        protocol: 'http', // Use 'http' or 'https' based on your localhost server
        hostname: 'localhost',
        port: '',
        pathname: '/**', // Matches any path on localhost
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
        port: '',
        pathname: '/**', // Allows any path from via.placeholder.com
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**', // Allows any path from placehold.co
      },
      // Dynamically add your API URL if it serves images
      {
        protocol: process.env.NEXT_PUBLIC_API_URL?.startsWith('https') ? 'https' : 'http',
        hostname: process.env.NEXT_PUBLIC_API_URL?.replace(/^https?:\/\//, '') || '',
        port: '',
        pathname: '/**',
      },
    ].filter(pattern => pattern.hostname), // Filter out patterns with empty hostnames
  },

  // Environment variables accessible in client-side code
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
    NEXT_PUBLIC_SOCKET_URL: process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000',
    NEXT_PUBLIC_SITE_NAME: process.env.NEXT_PUBLIC_SITE_NAME || 'Fenkparet',
    NEXT_PUBLIC_CURRENCY: process.env.NEXT_PUBLIC_CURRENCY || 'HTG',
  },

  // Internationalization configuration (only for non-static builds)
  ...(!isStatic && {
    i18n: {
      locales: ['en', 'fr'],
      defaultLocale: 'fr',
      localeDetection: false,
    }
  }),

  // Security and SEO headers (only for non-static builds)
  ...(!isStatic && {
    async headers() {
      return [
        {
          source: '/(.*)', // Apply to all routes
          headers: [
            {
              key: 'X-Frame-Options',
              value: 'DENY', // Prevents clickjacking by disallowing framing
            },
            {
              key: 'X-Content-Type-Options',
              value: 'nosniff', // Prevents MIME-sniffing
            },
            {
              key: 'Referrer-Policy',
              value: 'origin-when-cross-origin', // Controls referrer information sent
            },
            {
              key: 'X-DNS-Prefetch-Control',
              value: 'on', // Enable DNS prefetching for performance
            },
            {
              key: 'Strict-Transport-Security',
              value: 'max-age=31536000; includeSubDomains', // Force HTTPS
            },
            {
              key: 'Permissions-Policy',
              value: 'camera=(), microphone=(), geolocation=()', // Restrict permissions
            },
          ],
        },
        {
          source: '/sitemap.xml',
          headers: [
            {
              key: 'Content-Type',
              value: 'application/xml',
            },
            {
              key: 'Cache-Control',
              value: 'public, max-age=86400, stale-while-revalidate=43200', // Cache for 24 hours
            },
          ],
        },
        {
          source: '/robots.txt',
          headers: [
            {
              key: 'Content-Type',
              value: 'text/plain',
            },
            {
              key: 'Cache-Control',
              value: 'public, max-age=86400', // Cache for 24 hours
            },
          ],
        },
      ];
    },

    // SEO-friendly redirects (only for non-static builds)
    async redirects() {
      return [
        {
          source: '/admin', // Incoming request path
          destination: '/admin/dashboard', // Redirect to this path
          permanent: true, // Permanent redirect (308 status code)
        },
        {
          source: '/shop',
          destination: '/products',
          permanent: true,
        },
        {
          source: '/store',
          destination: '/products',
          permanent: true,
        },
        {
          source: '/catalogue',
          destination: '/products',
          permanent: true,
        },
        {
          source: '/product/:id',
          destination: '/products/:id',
          permanent: true,
        },
      ];
    },

    // SEO rewrites for better URLs (only for non-static builds)
    async rewrites() {
      return [
        {
          source: '/p/:id',
          destination: '/products/:id',
        },
        {
          source: '/c/:category',
          destination: '/products/category/:category',
        },
      ];
    },
  }),

  // Webpack configuration adjustments
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Ignore specific warnings during webpack compilation
    config.ignoreWarnings = [
      { module: /node_modules\/socket\.io-client/ }, // Ignore warnings from socket.io-client module
    ];

    // Performance optimizations
    if (!dev) {
      // Production optimizations
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
          admin: {
            test: /[\\/]pages[\\/]admin[\\/]/,
            name: 'admin',
            chunks: 'all',
            priority: 10,
          },
        },
      };
    }

    // Enable fast refresh optimizations for development
    if (dev && !isServer) {
      config.optimization.usedExports = false;
      // Fix source map issues
      config.devtool = 'eval-source-map';
    }

    return config;
  },

  // Compression and performance
  compress: true,
  
  // Experimental features for performance
  experimental: {
    optimizeCss: !isDev,
    scrollRestoration: true,
  },

  // ESLint configuration
  eslint: {
    ignoreDuringBuilds: false,
    dirs: ['pages', 'components', 'utils'],
  },
};

module.exports = nextConfig;