// API Configuration for GitHub Pages deployment
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://fenkparet-backend.onrender.com';

export const apiConfig = {
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false, // Set to true if using cookies for auth
  mode: 'cors', // Explicitly set CORS mode
};

// Complete API endpoints
export const apiEndpoints = {
  // Authentication
  auth: {
    login: `${API_BASE_URL}/api/auth/login`,
    register: `${API_BASE_URL}/api/auth/register`,
    logout: `${API_BASE_URL}/api/auth/logout`,
    me: `${API_BASE_URL}/api/auth/me`,
    refresh: `${API_BASE_URL}/api/auth/refresh`,
  },
  
  // Products
  products: {
    list: `${API_BASE_URL}/api/products`,
    byId: (id) => `${API_BASE_URL}/api/products/${id}`,
    featured: `${API_BASE_URL}/api/products/featured`,
    newArrivals: `${API_BASE_URL}/api/products/new-arrivals`,
    search: `${API_BASE_URL}/api/products/search`,
    byCategory: (slug) => `${API_BASE_URL}/api/products/category/${slug}`,
    categories: `${API_BASE_URL}/api/products/categories`,
  },
  
  // Orders
  orders: {
    create: `${API_BASE_URL}/api/orders`,
    byId: (id) => `${API_BASE_URL}/api/orders/${id}`,
    track: (orderNumber) => `${API_BASE_URL}/api/orders/track/${orderNumber}`,
    userOrders: (userId) => `${API_BASE_URL}/api/orders/user/${userId}`,
  },
  
  // Reviews
  reviews: {
    create: `${API_BASE_URL}/api/reviews`,
    byProduct: (productId) => `${API_BASE_URL}/api/reviews/product/${productId}`,
    vote: (reviewId) => `${API_BASE_URL}/api/reviews/${reviewId}/vote`,
    canReview: (productId) => `${API_BASE_URL}/api/reviews/can-review/${productId}`,
    myReviews: `${API_BASE_URL}/api/reviews/my-reviews`,
  },
  
  // Support Tickets
  tickets: {
    create: `${API_BASE_URL}/api/tickets`,
    byId: (id) => `${API_BASE_URL}/api/tickets/${id}`,
    userTickets: (userId) => `${API_BASE_URL}/api/tickets/user/${userId}`,
  },
  
  // Admin
  admin: {
    dashboard: `${API_BASE_URL}/api/admin/dashboard`,
    users: `${API_BASE_URL}/api/admin/users`,
    products: `${API_BASE_URL}/api/admin/products`,
    orders: `${API_BASE_URL}/api/admin/orders`,
    tickets: `${API_BASE_URL}/api/admin/tickets`,
    analytics: `${API_BASE_URL}/api/admin/analytics`,
    inventory: {
      alerts: `${API_BASE_URL}/api/admin/inventory/alerts`,
      bulkUpdate: `${API_BASE_URL}/api/admin/inventory/bulk-update`,
    },
    categories: `${API_BASE_URL}/api/admin/categories`,
    settings: `${API_BASE_URL}/api/admin/settings`,
  },
  
  // Feedback (for testing)
  feedback: `${API_BASE_URL}/api/feedback`,
};

// Helper function to make API requests
export const apiRequest = async (url, options = {}) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  
  const config = {
    ...apiConfig,
    ...options,
    headers: {
      ...apiConfig.headers,
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  };
  
  try {
    const response = await fetch(url, config);
    
    // Handle non-JSON responses
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return { data: await response.text(), status: response.status };
    }
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }
    
    return { data, status: response.status };
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

// Specific API functions
export const api = {
  // Authentication
  login: (credentials) => 
    apiRequest(apiEndpoints.auth.login, {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),
    
  register: (userData) =>
    apiRequest(apiEndpoints.auth.register, {
      method: 'POST',
      body: JSON.stringify(userData),
    }),
    
  getCurrentUser: () =>
    apiRequest(apiEndpoints.auth.me),
    
  // Products
  getProducts: (params = {}) => {
    const url = new URL(apiEndpoints.products.list);
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== '') {
        url.searchParams.append(key, params[key]);
      }
    });
    return apiRequest(url.toString());
  },
  
  getProduct: (id) =>
    apiRequest(apiEndpoints.products.byId(id)),
    
  getFeaturedProducts: () =>
    apiRequest(apiEndpoints.products.featured),
    
  // Orders
  createOrder: (orderData) =>
    apiRequest(apiEndpoints.orders.create, {
      method: 'POST',
      body: JSON.stringify(orderData),
    }),
    
  trackOrder: (orderNumber) =>
    apiRequest(apiEndpoints.orders.track(orderNumber)),
    
  // Reviews
  createReview: (reviewData) =>
    apiRequest(apiEndpoints.reviews.create, {
      method: 'POST',
      body: JSON.stringify(reviewData),
    }),
    
  getProductReviews: (productId) =>
    apiRequest(apiEndpoints.reviews.byProduct(productId)),
    
  // Admin
  getDashboardStats: () =>
    apiRequest(apiEndpoints.admin.dashboard),
    
  getAdminProducts: (params = {}) => {
    const url = new URL(apiEndpoints.admin.products);
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== '') {
        url.searchParams.append(key, params[key]);
      }
    });
    return apiRequest(url.toString());
  },
  
  createProduct: (productData) =>
    apiRequest(apiEndpoints.admin.products, {
      method: 'POST',
      body: productData, // FormData for file uploads
    }),
    
  updateProduct: (id, productData) =>
    apiRequest(`${apiEndpoints.admin.products}/${id}`, {
      method: 'PUT',
      body: productData, // FormData for file uploads
    }),
    
  // Feedback
  submitFeedback: (feedbackData) =>
    apiRequest(apiEndpoints.feedback, {
      method: 'POST',
      body: JSON.stringify(feedbackData),
    }),
};

export default api;