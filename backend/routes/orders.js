const express = require('express');
const { body } = require('express-validator');
const orderController = require('../controllers/orderController');
const { authenticateToken, requireAdmin, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// Validation rules
const createOrderValidation = [
  body('items')
    .isArray({ min: 1 })
    .withMessage('At least one item is required'),
  body('items.*.product')
    .isMongoId()
    .withMessage('Valid product ID is required'),
  body('items.*.quantity')
    .isInt({ min: 1 })
    .withMessage('Quantity must be at least 1'),
  body('customer.firstName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name is required'),
  body('customer.lastName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name is required'),
  body('customer.email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  body('shippingAddress.street')
    .trim()
    .notEmpty()
    .withMessage('Street address is required'),
  body('shippingAddress.city')
    .trim()
    .notEmpty()
    .withMessage('City is required'),
  body('payment.moncash.confirmationNumber')
    .trim()
    .notEmpty()
    .withMessage('MonCash confirmation number is required'),
  body('payment.moncash.customerName')
    .trim()
    .notEmpty()
    .withMessage('Customer name for MonCash is required')
];

const updateStatusValidation = [
  body('status')
    .isIn(['pending', 'payment-pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'])
    .withMessage('Invalid status'),
  body('message')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Message must be less than 500 characters')
];

const confirmPaymentValidation = [
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes must be less than 500 characters')
];

const cancelOrderValidation = [
  body('reason')
    .trim()
    .notEmpty()
    .withMessage('Cancellation reason is required')
];

// Public routes
router.get('/track/:orderNumber', orderController.trackOrder);

// User routes (authentication optional for guest orders)
router.post('/', optionalAuth, createOrderValidation, orderController.createOrder);
router.get('/my-orders', authenticateToken, orderController.getUserOrders);
router.get('/:orderNumber', optionalAuth, orderController.getOrderByNumber);

// New route for placing order with confirmation number
router.post('/place-order-with-confirmation', optionalAuth, orderController.placeOrderWithConfirmation);

// Admin routes
router.get('/', authenticateToken, requireAdmin, orderController.getAllOrders);
router.patch('/:orderId/confirm-payment', 
  authenticateToken, 
  requireAdmin, 
  confirmPaymentValidation, 
  orderController.confirmPayment
);
router.patch('/:orderId/status', 
  authenticateToken, 
  requireAdmin, 
  updateStatusValidation, 
  orderController.updateOrderStatus
);
router.patch('/:orderId/cancel', 
  authenticateToken, 
  requireAdmin, 
  cancelOrderValidation, 
  orderController.cancelOrder
);
router.get('/analytics/sales', 
  authenticateToken, 
  requireAdmin, 
  orderController.getOrderAnalytics
);

module.exports = router;