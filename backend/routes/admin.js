const express = require('express');
const { body } = require('express-validator');
const adminController = require('../controllers/adminController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { uploadConfigs } = require('../middleware/upload');

const router = express.Router();

// Apply admin authentication to all routes
router.use(authenticateToken);
router.use(requireAdmin);

// Dashboard and Analytics
router.get('/dashboard', adminController.getDashboardStats);
router.get('/analytics/sales', adminController.getSalesAnalytics);
router.get('/analytics/traffic', adminController.getTrafficAnalytics);
router.get('/analytics/products', adminController.getProductAnalytics);

// User Management
router.get('/users', adminController.getAllUsers);
router.get('/users/:userId', adminController.getUserById);
router.patch('/users/:userId/status', [
  body('isActive').isBoolean().withMessage('Status must be boolean')
], adminController.updateUserStatus);
router.patch('/users/:userId/role', [
  body('role').isIn(['user', 'admin']).withMessage('Invalid role')
], adminController.updateUserRole);

// Category Management
router.get('/categories', adminController.getAllCategories);
router.post('/categories', [
  ...uploadConfigs.single('image'),
  body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Name is required'),
  body('description').optional().isLength({ max: 500 }).withMessage('Description too long')
], adminController.createCategory);
router.put('/categories/:categoryId', [
  ...uploadConfigs.single('image'),
  body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Name is required'),
  body('description').optional().isLength({ max: 500 }).withMessage('Description too long')
], adminController.updateCategory);
router.delete('/categories/:categoryId', adminController.deleteCategory);

// Product Management (Enhanced)
router.get('/products/analytics', adminController.getProductPerformance);
router.get('/products/low-stock', adminController.getLowStockProducts);
router.patch('/products/:productId/feature', [
  body('featured').isBoolean().withMessage('Featured must be boolean')
], adminController.toggleProductFeature);

// Order Management (Enhanced)
router.get('/orders/pending-payment', adminController.getPendingPaymentOrders);
router.get('/orders/recent', adminController.getRecentOrders);
router.post('/orders/:orderId/extend', [
  body('reason').optional().trim().isLength({ max: 200 }).withMessage('Reason too long')
], adminController.extendOrderExpiration);

// Inventory Management
router.get('/inventory/alerts', adminController.getInventoryAlerts);
router.post('/inventory/bulk-update', [
  body('updates').isArray().withMessage('Updates must be an array'),
  body('updates.*.productId').isMongoId().withMessage('Valid product ID required'),
  body('updates.*.quantity').isInt({ min: 0 }).withMessage('Quantity must be non-negative')
], adminController.bulkUpdateInventory);

// Customer Support
router.get('/support/overview', adminController.getSupportOverview);

// Site Settings
router.get('/settings', adminController.getSettings);
router.put('/settings', [
  body('siteName').optional().trim().isLength({ max: 100 }),
  body('currency').optional().trim().isLength({ max: 10 }),
  body('shippingRate').optional().isFloat({ min: 0 }),
  body('taxRate').optional().isFloat({ min: 0, max: 1 }),
  body('freeShippingThreshold').optional().isFloat({ min: 0 })
], adminController.updateSettings);

// Reports
router.get('/reports/sales', adminController.getSalesReport);
router.get('/reports/customers', adminController.getCustomerReport);
router.get('/reports/products', adminController.getProductReport);
router.get('/reports/export/:type', adminController.exportReport);

// Notifications
router.get('/notifications', adminController.getNotifications);
router.patch('/notifications/:notificationId/read', adminController.markNotificationRead);
router.delete('/notifications/:notificationId', adminController.deleteNotification);

// System Health
router.get('/system/health', adminController.getSystemHealth);
router.get('/system/logs', adminController.getSystemLogs);

module.exports = router;