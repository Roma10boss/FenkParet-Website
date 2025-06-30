const express = require('express');
const { body } = require('express-validator');
const productController = require('../controllers/productController');
const { authenticateToken, requireAdmin, optionalAuth } = require('../middleware/auth');
const { uploadConfigs } = require('../middleware/upload');

const router = express.Router();

// Validation rules
const productValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage('Product name must be between 2 and 200 characters'),
  body('description')
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Description must be between 10 and 2000 characters'),
  body('category')
    .isMongoId()
    .withMessage('Valid category ID is required'),
  body('price')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  body('comparePrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Compare price must be a positive number'),
  body('weight')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Weight must be a positive number')
];

const inventoryValidation = [
  body('quantity')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Quantity must be a non-negative integer'),
  body('lowStockThreshold')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Low stock threshold must be a non-negative integer')
];

// Public routes
router.get('/', optionalAuth, productController.getAllProducts);
router.get('/featured', productController.getFeaturedProducts);
router.get('/new-arrivals', productController.getNewArrivals);
router.get('/search', productController.searchProducts);
router.get('/category/:categorySlug', productController.getProductsByCategory);
router.get('/:id', optionalAuth, productController.getProductById);

// Admin routes
router.post('/', 
  authenticateToken, 
  requireAdmin, 
  ...uploadConfigs.multiple('images', 5),
  productValidation, 
  productController.createProduct
);

router.put('/:id', 
  authenticateToken, 
  requireAdmin, 
  ...uploadConfigs.multiple('images', 5),
  productValidation, 
  productController.updateProduct
);

router.delete('/:id', 
  authenticateToken, 
  requireAdmin, 
  productController.deleteProduct
);

router.patch('/:id/inventory', 
  authenticateToken, 
  requireAdmin, 
  inventoryValidation, 
  productController.updateInventory
);

module.exports = router;