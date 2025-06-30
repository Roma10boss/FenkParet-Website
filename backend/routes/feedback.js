const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

// Simple in-memory storage for feedback (in production, use MongoDB)
const feedbackStorage = [];

// Validation rules
const feedbackValidation = [
  body('type')
    .isIn(['general', 'bug', 'feature', 'ui', 'performance', 'admin', 'mobile', 'payment'])
    .withMessage('Invalid feedback type'),
  body('message')
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Message must be between 10 and 2000 characters'),
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required if provided')
];

// Submit feedback
router.post('/', feedbackValidation, async (req, res) => {
  try {
    const {
      type,
      message,
      email,
      rating,
      userAgent,
      timestamp,
      page,
      url,
      screenSize,
      viewportSize
    } = req.body;

    const feedback = {
      id: Date.now().toString(),
      type,
      message,
      email: email || 'anonymous',
      rating,
      userAgent,
      timestamp: timestamp || new Date().toISOString(),
      page,
      url,
      screenSize,
      viewportSize,
      ip: req.ip || req.connection.remoteAddress,
      createdAt: new Date()
    };

    // Store feedback (in production, save to MongoDB)
    feedbackStorage.push(feedback);

    // Log feedback to console for immediate visibility
    console.log('📝 NEW FEEDBACK RECEIVED:');
    console.log('========================');
    console.log(`Type: ${type}`);
    console.log(`Rating: ${rating}/5 stars`);
    console.log(`Page: ${page}`);
    console.log(`Message: ${message}`);
    console.log(`Email: ${email || 'Anonymous'}`);
    console.log(`Timestamp: ${timestamp}`);
    console.log(`Device: ${screenSize} (${userAgent})`);
    console.log('========================\n');

    // In production, you might want to:
    // 1. Save to MongoDB
    // 2. Send notification email to admin
    // 3. Create a support ticket
    // 4. Send to analytics service

    res.status(201).json({
      success: true,
      message: 'Feedback submitted successfully',
      id: feedback.id
    });

  } catch (error) {
    console.error('Feedback submission error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit feedback'
    });
  }
});

// Get all feedback (admin only)
router.get('/', async (req, res) => {
  try {
    // In production, add authentication middleware here
    // const { authenticateToken, requireAdmin } = require('../middleware/auth');
    
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const type = req.query.type;

    let filteredFeedback = feedbackStorage;
    
    if (type) {
      filteredFeedback = feedbackStorage.filter(f => f.type === type);
    }

    // Sort by newest first
    filteredFeedback.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedFeedback = filteredFeedback.slice(startIndex, endIndex);

    res.json({
      success: true,
      feedback: paginatedFeedback,
      pagination: {
        page,
        limit,
        total: filteredFeedback.length,
        pages: Math.ceil(filteredFeedback.length / limit)
      },
      stats: {
        total: feedbackStorage.length,
        byType: feedbackStorage.reduce((acc, f) => {
          acc[f.type] = (acc[f.type] || 0) + 1;
          return acc;
        }, {}),
        averageRating: feedbackStorage.length > 0 
          ? (feedbackStorage.reduce((sum, f) => sum + f.rating, 0) / feedbackStorage.length).toFixed(1)
          : 0
      }
    });

  } catch (error) {
    console.error('Get feedback error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve feedback'
    });
  }
});

// Export feedback data (admin only)
router.get('/export', async (req, res) => {
  try {
    // In production, add authentication middleware here
    
    const csv = [
      'ID,Type,Rating,Message,Email,Page,Timestamp,Device',
      ...feedbackStorage.map(f => 
        `"${f.id}","${f.type}","${f.rating}","${f.message.replace(/"/g, '""')}","${f.email}","${f.page}","${f.timestamp}","${f.screenSize}"`
      )
    ].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="fenkparet-feedback.csv"');
    res.send(csv);

  } catch (error) {
    console.error('Export feedback error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export feedback'
    });
  }
});

module.exports = router;