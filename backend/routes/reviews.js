const express = require('express');
const { body } = require('express-validator');
const reviewController = require('../controllers/reviewController');
const { authenticateToken, requireAdmin, optionalAuth } = require('../middleware/auth');
const { uploadConfigs } = require('../middleware/upload');

const router = express.Router();

// Validation rules
const createReviewValidation = [
  body('productId')
    .isMongoId()
    .withMessage('Valid product ID is required'),
  body('orderId')
    .isMongoId()
    .withMessage('Valid order ID is required'),
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  body('title')
    .trim()
    .isLength({ min: 5, max: 100 })
    .withMessage('Title must be between 5 and 100 characters'),
  body('comment')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Comment must be between 10 and 1000 characters')
];

const voteValidation = [
  body('vote')
    .isIn(['yes', 'no'])
    .withMessage('Vote must be either "yes" or "no"')
];

const updateStatusValidation = [
  body('status')
    .isIn(['pending', 'approved', 'rejected'])
    .withMessage('Invalid status'),
  body('adminNotes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Admin notes must be less than 500 characters')
];

const respondValidation = [
  body('response')
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Response must be between 1 and 1000 characters')
];

// Public routes
router.get('/product/:productId', reviewController.getProductReviews);

// User routes (authentication required)
router.post('/',
  authenticateToken,
  ...uploadConfigs.mixed([{ name: 'images', maxCount: 3 }]),
  createReviewValidation,
  reviewController.createReview
);

router.get('/my-reviews',
  authenticateToken,
  reviewController.getUserReviews
);

router.post('/:reviewId/vote',
  authenticateToken,
  voteValidation,
  reviewController.voteOnReview
);

router.get('/can-review/:productId',
  authenticateToken,
  reviewController.canUserReview
);

// Admin routes
router.get('/',
  authenticateToken,
  requireAdmin,
  reviewController.getAllReviews
);

router.patch('/:reviewId/status',
  authenticateToken,
  requireAdmin,
  updateStatusValidation,
  reviewController.updateReviewStatus
);

router.post('/:reviewId/respond',
  authenticateToken,
  requireAdmin,
  respondValidation,
  reviewController.respondToReview
);

module.exports = router;