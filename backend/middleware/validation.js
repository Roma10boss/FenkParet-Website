const { body, param, query } = require('express-validator');

// Common validation rules
const commonValidations = {
  // MongoDB ObjectId validation
  mongoId: (field = 'id') => 
    param(field).isMongoId().withMessage('Invalid ID format'),

  // Email validation
  email: (field = 'email') =>
    body(field)
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid email address'),

  // Password validation
  password: (field = 'password') =>
    body(field)
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long'),

  // Name validation
  name: (field, min = 2, max = 50) =>
    body(field)
      .trim()
      .isLength({ min, max })
      .withMessage(`${field} must be between ${min} and ${max} characters`),

  // Phone validation
  phone: (field = 'phone') =>
    body(field)
      .optional()
      .matches(/^[\+]?[1-9][\d]{0,15}$/)
      .withMessage('Please provide a valid phone number'),

  // URL validation
  url: (field) =>
    body(field)
      .optional()
      .isURL()
      .withMessage('Please provide a valid URL'),

  // Number validation
  positiveNumber: (field) =>
    body(field)
      .isFloat({ min: 0 })
      .withMessage(`${field} must be a positive number`),

  // Integer validation
  positiveInteger: (field) =>
    body(field)
      .isInt({ min: 0 })
      .withMessage(`${field} must be a positive integer`),

  // Boolean validation
  boolean: (field) =>
    body(field)
      .isBoolean()
      .withMessage(`${field} must be a boolean value`),

  // Array validation
  array: (field, minLength = 0) =>
    body(field)
      .isArray({ min: minLength })
      .withMessage(`${field} must be an array with at least ${minLength} items`),

  // Enum validation
  enum: (field, values) =>
    body(field)
      .isIn(values)
      .withMessage(`${field} must be one of: ${values.join(', ')}`),

  // Date validation
  date: (field) =>
    body(field)
      .isISO8601()
      .toDate()
      .withMessage(`${field} must be a valid date`),

  // Pagination validation
  pagination: () => [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100')
  ]
};

// User validation rules
const userValidation = {
  register: [
    commonValidations.name('firstName'),
    commonValidations.name('lastName'),
    commonValidations.email(),
    commonValidations.password(),
    commonValidations.phone('phone')
  ],

  login: [
    commonValidations.email(),
    body('password').notEmpty().withMessage('Password is required')
  ],

  updateProfile: [
    commonValidations.name('firstName').optional(),
    commonValidations.name('lastName').optional(),
    commonValidations.phone('phone')
  ],

  changePassword: [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    commonValidations.password('newPassword')
  ]
};

// Product validation rules
const productValidation = {
  create: [
    commonValidations.name('name', 2, 200),
    body('description')
      .trim()
      .isLength({ min: 10, max: 2000 })
      .withMessage('Description must be between 10 and 2000 characters'),
    commonValidations.mongoId('category').withMessage('Valid category ID is required'),
    commonValidations.positiveNumber('price'),
    commonValidations.positiveNumber('comparePrice').optional(),
    commonValidations.positiveNumber('cost').optional(),
    commonValidations.positiveNumber('weight').optional(),
    body('sku').optional().trim().isLength({ max: 50 }),
    body('barcode').optional().trim().isLength({ max: 50 }),
    commonValidations.array('tags').optional(),
    commonValidations.boolean('featured').optional()
  ],

  update: [
    commonValidations.mongoId(),
    commonValidations.name('name', 2, 200).optional(),
    body('description')
      .optional()
      .trim()
      .isLength({ min: 10, max: 2000 })
      .withMessage('Description must be between 10 and 2000 characters'),
    commonValidations.mongoId('category').optional(),
    commonValidations.positiveNumber('price').optional(),
    commonValidations.positiveNumber('comparePrice').optional(),
    commonValidations.positiveNumber('cost').optional(),
    commonValidations.positiveNumber('weight').optional(),
    commonValidations.boolean('featured').optional()
  ],

  updateInventory: [
    commonValidations.mongoId(),
    commonValidations.positiveInteger('quantity').optional(),
    commonValidations.positiveInteger('lowStockThreshold').optional()
  ]
};

// Order validation rules
const orderValidation = {
  create: [
    commonValidations.array('items', 1),
    body('items.*.product').isMongoId().withMessage('Valid product ID is required'),
    body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
    
    // Customer info
    commonValidations.name('customer.firstName'),
    commonValidations.name('customer.lastName'),
    body('customer.email').isEmail().withMessage('Valid customer email is required'),
    commonValidations.phone('customer.phone'),
    
    // Shipping address
    body('shippingAddress.street').trim().notEmpty().withMessage('Street address is required'),
    body('shippingAddress.city').trim().notEmpty().withMessage('City is required'),
    body('shippingAddress.country').optional().trim(),
    
    // Payment info
    body('payment.moncash.confirmationNumber')
      .trim()
      .notEmpty()
      .withMessage('MonCash confirmation number is required'),
    body('payment.moncash.customerName')
      .trim()
      .notEmpty()
      .withMessage('Customer name for MonCash is required'),
    body('payment.moncash.amount')
      .isFloat({ min: 0 })
      .withMessage('Payment amount must be positive')
  ],

  updateStatus: [
    commonValidations.mongoId('orderId'),
    commonValidations.enum('status', [
      'pending', 'payment-pending', 'confirmed', 'processing', 
      'shipped', 'delivered', 'cancelled', 'refunded'
    ]),
    body('message').optional().trim().isLength({ max: 500 }),
    body('trackingNumber').optional().trim(),
    body('carrier').optional().trim()
  ],

  confirmPayment: [
    commonValidations.mongoId('orderId'),
    body('notes').optional().trim().isLength({ max: 500 })
  ]
};

// Ticket validation rules
const ticketValidation = {
  create: [
    body('subject')
      .trim()
      .isLength({ min: 5, max: 200 })
      .withMessage('Subject must be between 5 and 200 characters'),
    commonValidations.enum('category', [
      'general-inquiry', 'order-issue', 'product-question', 
      'shipping-issue', 'payment-issue', 'return-refund',
      'technical-support', 'complaint', 'suggestion', 'other'
    ]),
    body('message')
      .trim()
      .isLength({ min: 10, max: 2000 })
      .withMessage('Message must be between 10 and 2000 characters'),
    commonValidations.enum('priority', ['low', 'medium', 'high', 'urgent']).optional(),
    commonValidations.name('customer.name', 2, 100),
    commonValidations.email('customer.email'),
    commonValidations.phone('customer.phone'),
    commonValidations.mongoId('relatedOrder').optional(),
    commonValidations.mongoId('relatedProduct').optional()
  ],

  addMessage: [
    commonValidations.mongoId('ticketId'),
    body('message')
      .trim()
      .isLength({ min: 1, max: 2000 })
      .withMessage('Message must be between 1 and 2000 characters'),
    commonValidations.boolean('isInternal').optional()
  ],

  update: [
    commonValidations.mongoId('ticketId'),
    commonValidations.enum('status', [
      'open', 'in-progress', 'waiting-customer', 
      'waiting-admin', 'resolved', 'closed'
    ]).optional(),
    commonValidations.enum('priority', ['low', 'medium', 'high', 'urgent']).optional(),
    commonValidations.mongoId('assignedTo').optional()
  ]
};

// Category validation rules
const categoryValidation = {
  create: [
    commonValidations.name('name', 2, 100),
    body('description')
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Description must be less than 500 characters'),
    commonValidations.mongoId('parent').optional(),
    commonValidations.positiveInteger('sortOrder').optional()
  ],

  update: [
    commonValidations.mongoId(),
    commonValidations.name('name', 2, 100).optional(),
    body('description')
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Description must be less than 500 characters'),
    commonValidations.mongoId('parent').optional(),
    commonValidations.positiveInteger('sortOrder').optional()
  ]
};

// Admin validation rules
const adminValidation = {
  updateUserStatus: [
    commonValidations.mongoId('userId'),
    commonValidations.boolean('isActive')
  ],

  updateUserRole: [
    commonValidations.mongoId('userId'),
    commonValidations.enum('role', ['user', 'admin'])
  ],

  bulkUpdateInventory: [
    commonValidations.array('updates', 1),
    body('updates.*.productId').isMongoId().withMessage('Valid product ID required'),
    body('updates.*.quantity').isInt({ min: 0 }).withMessage('Quantity must be non-negative')
  ]
};

// Contact form validation
const contactValidation = {
  submit: [
    commonValidations.name('name', 2, 100),
    commonValidations.email(),
    commonValidations.phone('phone'),
    body('subject')
      .optional()
      .trim()
      .isLength({ max: 200 })
      .withMessage('Subject must be less than 200 characters'),
    body('message')
      .trim()
      .isLength({ min: 10, max: 2000 })
      .withMessage('Message must be between 10 and 2000 characters')
  ]
};

// Search and filter validation
const searchValidation = {
  products: [
    query('q')
      .optional()
      .trim()
      .isLength({ min: 2 })
      .withMessage('Search query must be at least 2 characters'),
    query('category').optional().isMongoId().withMessage('Invalid category ID'),
    query('minPrice').optional().isFloat({ min: 0 }).withMessage('Minimum price must be positive'),
    query('maxPrice').optional().isFloat({ min: 0 }).withMessage('Maximum price must be positive'),
    commonValidations.enum('sortBy', ['name', 'price', 'createdAt', 'rating']).optional(),
    commonValidations.enum('sortOrder', ['asc', 'desc']).optional(),
    ...commonValidations.pagination()
  ]
};

module.exports = {
  commonValidations,
  userValidation,
  productValidation,
  orderValidation,
  ticketValidation,
  categoryValidation,
  adminValidation,
  contactValidation,
  searchValidation
};