import axios from 'axios';

const api = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_URL || 'https://fenkparet-backend.onrender.com'}/api`,
  withCredentials: false,
  timeout: 10000, // 10 second timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request cache for optimization
const requestCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Add request interceptor for auth and caching
api.interceptors.request.use(
  (config) => {
    // Add authorization token if available
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    // Add cache key for GET requests
    if (config.method === 'get') {
      const cacheKey = `${config.url}?${new URLSearchParams(config.params).toString()}`;
      config.cacheKey = cacheKey;
      
      // Check cache
      const cached = requestCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        config.useCache = true;
        config.cachedData = cached.data;
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for caching and error handling
api.interceptors.response.use(
  (response) => {
    // Cache successful GET responses
    if (response.config.method === 'get' && response.config.cacheKey) {
      requestCache.set(response.config.cacheKey, {
        data: response.data,
        timestamp: Date.now()
      });
      
      // Clean old cache entries
      if (requestCache.size > 100) {
        const entries = Array.from(requestCache.entries());
        entries.slice(0, 50).forEach(([key]) => requestCache.delete(key));
      }
    }
    return response;
  },
  (error) => {
    // Enhanced error handling
    if (error.response) {
      const status = error.response.status;
      const message = error.response.data?.message || 'Une erreur est survenue';
      
      // Don't log 404s as errors for product/category requests
      if (status === 404 && (
        error.config.url?.includes('/products') || 
        error.config.url?.includes('/categories')
      )) {
        console.log('Resource not found:', error.config.url);
      } else {
        console.error('API Error:', { status, message, url: error.config.url });
      }
      
      error.message = message;
    } else if (error.request) {
      console.error('Network Error: No response received');
      error.message = 'Problème de connexion réseau';
    } else {
      console.error('Request Error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// Clear cache function
api.clearCache = () => {
  requestCache.clear();
};

// Get cached response if available
api.getCached = (config) => {
  if (config.useCache && config.cachedData) {
    return Promise.resolve({ data: config.cachedData });
  }
  return null;
};

export default api;
