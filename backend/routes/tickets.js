const express = require('express');
const { body } = require('express-validator');
const ticketController = require('../controllers/ticketController');
const { authenticateToken, requireAdmin, optionalAuth } = require('../middleware/auth');
const { uploadConfigs } = require('../middleware/upload');

const router = express.Router();

// Validation rules
const createTicketValidation = [
  body('subject')
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Subject must be between 5 and 200 characters'),
  body('category')
    .isIn([
      'general-inquiry',
      'order-issue',
      'product-question',
      'shipping-issue',
      'payment-issue',
      'return-refund',
      'technical-support',
      'complaint',
      'suggestion',
      'other'
    ])
    .withMessage('Invalid category'),
  body('message')
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Message must be between 10 and 2000 characters'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'urgent'])
    .withMessage('Invalid priority'),
  body('customer.name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Customer name is required'),
  body('customer.email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required')
];

const addMessageValidation = [
  body('message')
    .trim()
    .isLength({ min: 1, max: 2000 })
    .withMessage('Message must be between 1 and 2000 characters'),
  body('isInternal')
    .optional()
    .isBoolean()
    .withMessage('isInternal must be a boolean')
];

const updateTicketValidation = [
  body('status')
    .optional()
    .isIn(['open', 'in-progress', 'waiting-customer', 'waiting-admin', 'resolved', 'closed'])
    .withMessage('Invalid status'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'urgent'])
    .withMessage('Invalid priority'),
  body('category')
    .optional()
    .isIn([
      'general-inquiry',
      'order-issue',
      'product-question',
      'shipping-issue',
      'payment-issue',
      'return-refund',
      'technical-support',
      'complaint',
      'suggestion',
      'other'
    ])
    .withMessage('Invalid category'),
  body('assignedTo')
    .optional()
    .isMongoId()
    .withMessage('Invalid assigned user ID')
];

const closeTicketValidation = [
  body('summary')
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Summary must be between 10 and 500 characters')
];

// Public/User routes
router.post('/', 
  optionalAuth, 
  ...uploadConfigs.mixed([{ name: 'attachments', maxCount: 3 }]),
  createTicketValidation, 
  ticketController.createTicket
);

router.get('/my-tickets', 
  optionalAuth, 
  ticketController.getUserTickets
);

router.get('/:ticketNumber', 
  optionalAuth, 
  ticketController.getTicketByNumber
);

router.post('/:ticketId/messages', 
  optionalAuth, 
  ...uploadConfigs.mixed([{ name: 'attachments', maxCount: 3 }]),
  addMessageValidation, 
  ticketController.addMessage
);

// Admin routes
router.get('/', 
  authenticateToken, 
  requireAdmin, 
  ticketController.getAllTickets
);

router.patch('/:ticketId', 
  authenticateToken, 
  requireAdmin, 
  updateTicketValidation, 
  ticketController.updateTicket
);

router.post('/:ticketId/close', 
  authenticateToken, 
  requireAdmin, 
  closeTicketValidation, 
  ticketController.closeTicket
);

router.get('/analytics/statistics', 
  authenticateToken, 
  requireAdmin, 
  ticketController.getTicketStatistics
);

module.exports = router;