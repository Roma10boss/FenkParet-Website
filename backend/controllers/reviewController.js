const Review = require('../models/Review');
const Product = require('../models/Product');
const Order = require('../models/Order');
const { validationResult } = require('express-validator');

const reviewController = {
  // Create a new review
  createReview: async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { productId, orderId, rating, title, comment } = req.body;
      const userId = req.user._id;

      // Check if product exists
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }

      // Check if order exists and belongs to user
      const order = await Order.findOne({
        _id: orderId,
        user: userId,
        'items.product': productId,
        status: { $in: ['delivered', 'completed'] }
      });

      if (!order) {
        return res.status(400).json({
          message: 'You can only review products from completed orders'
        });
      }

      // Check if user has already reviewed this product
      const existingReview = await Review.findOne({
        product: productId,
        user: userId
      });

      if (existingReview) {
        return res.status(400).json({
          message: 'You have already reviewed this product'
        });
      }

      // Process uploaded images
      const images = [];
      if (req.files && req.files.length > 0) {
        req.files.forEach((file, index) => {
          images.push({
            url: `/uploads/reviews/${file.filename}`,
            alt: `Review image ${index + 1}`
          });
        });
      }

      // Create review
      const review = new Review({
        product: productId,
        user: userId,
        order: orderId,
        rating,
        title,
        comment,
        images,
        verified: true // Will be verified in pre-save middleware
      });

      await review.save();

      // Populate user data for response
      await review.populate('user', 'name');

      res.status(201).json({
        message: 'Review submitted successfully',
        review
      });
    } catch (error) {
      console.error('Create review error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  // Get reviews for a product
  getProductReviews: async (req, res) => {
    try {
      const { productId } = req.params;
      const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

      const skip = (parseInt(page) - 1) * parseInt(limit);
      const sort = {};
      sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

      const [reviews, total, stats] = await Promise.all([
        Review.find({ product: productId, status: 'approved' })
          .populate('user', 'name')
          .populate('response.respondedBy', 'name')
          .sort(sort)
          .skip(skip)
          .limit(parseInt(limit)),
        Review.countDocuments({ product: productId, status: 'approved' }),
        Review.getProductRatingStats(productId)
      ]);

      res.json({
        reviews,
        stats,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      });
    } catch (error) {
      console.error('Get product reviews error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  // Vote on review helpfulness
  voteOnReview: async (req, res) => {
    try {
      const { reviewId } = req.params;
      const { vote } = req.body; // 'yes' or 'no'
      const userId = req.user._id;

      if (!['yes', 'no'].includes(vote)) {
        return res.status(400).json({ message: 'Invalid vote value' });
      }

      const review = await Review.findById(reviewId);
      if (!review) {
        return res.status(404).json({ message: 'Review not found' });
      }

      // Check if user has already voted
      const existingVoteIndex = review.helpful.users.findIndex(
        v => v.user.toString() === userId.toString()
      );

      if (existingVoteIndex !== -1) {
        const existingVote = review.helpful.users[existingVoteIndex].vote;
        
        // Remove previous vote count
        review.helpful[existingVote]--;
        
        // Update or remove vote
        if (existingVote === vote) {
          // Remove vote if same
          review.helpful.users.splice(existingVoteIndex, 1);
        } else {
          // Update vote
          review.helpful.users[existingVoteIndex].vote = vote;
          review.helpful[vote]++;
        }
      } else {
        // Add new vote
        review.helpful.users.push({ user: userId, vote });
        review.helpful[vote]++;
      }

      await review.save();

      res.json({
        message: 'Vote recorded successfully',
        helpful: {
          yes: review.helpful.yes,
          no: review.helpful.no,
          userVote: review.getUserVote(userId)
        }
      });
    } catch (error) {
      console.error('Vote on review error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  // Get user's reviews
  getUserReviews: async (req, res) => {
    try {
      const { page = 1, limit = 10 } = req.query;
      const userId = req.user._id;
      const skip = (parseInt(page) - 1) * parseInt(limit);

      const [reviews, total] = await Promise.all([
        Review.find({ user: userId })
          .populate('product', 'name images')
          .populate('response.respondedBy', 'name')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(parseInt(limit)),
        Review.countDocuments({ user: userId })
      ]);

      res.json({
        reviews,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      });
    } catch (error) {
      console.error('Get user reviews error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  // Admin: Get all reviews
  getAllReviews: async (req, res) => {
    try {
      const {
        page = 1,
        limit = 20,
        status,
        rating,
        productId,
        search
      } = req.query;

      const filter = {};
      if (status) filter.status = status;
      if (rating) filter.rating = parseInt(rating);
      if (productId) filter.product = productId;

      if (search) {
        filter.$or = [
          { title: { $regex: search, $options: 'i' } },
          { comment: { $regex: search, $options: 'i' } }
        ];
      }

      const skip = (parseInt(page) - 1) * parseInt(limit);

      const [reviews, total] = await Promise.all([
        Review.find(filter)
          .populate('user', 'name email')
          .populate('product', 'name')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(parseInt(limit)),
        Review.countDocuments(filter)
      ]);

      res.json({
        reviews,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      });
    } catch (error) {
      console.error('Get all reviews error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  // Admin: Update review status
  updateReviewStatus: async (req, res) => {
    try {
      const { reviewId } = req.params;
      const { status, adminNotes } = req.body;

      if (!['pending', 'approved', 'rejected'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status' });
      }

      const review = await Review.findById(reviewId);
      if (!review) {
        return res.status(404).json({ message: 'Review not found' });
      }

      review.status = status;
      if (adminNotes) review.adminNotes = adminNotes;

      await review.save();

      res.json({
        message: 'Review status updated successfully',
        review
      });
    } catch (error) {
      console.error('Update review status error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  // Admin: Respond to review
  respondToReview: async (req, res) => {
    try {
      const { reviewId } = req.params;
      const { response } = req.body;

      const review = await Review.findById(reviewId);
      if (!review) {
        return res.status(404).json({ message: 'Review not found' });
      }

      review.response = {
        text: response,
        respondedBy: req.user._id,
        respondedAt: new Date()
      };

      await review.save();
      await review.populate('response.respondedBy', 'name');

      res.json({
        message: 'Response added successfully',
        review
      });
    } catch (error) {
      console.error('Respond to review error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  // Check if user can review product
  canUserReview: async (req, res) => {
    try {
      const { productId } = req.params;
      const userId = req.user._id;

      // Check if user has purchased this product
      const order = await Order.findOne({
        user: userId,
        'items.product': productId,
        status: { $in: ['delivered', 'completed'] }
      });

      if (!order) {
        return res.json({ canReview: false, reason: 'Product not purchased' });
      }

      // Check if user has already reviewed
      const existingReview = await Review.findOne({
        product: productId,
        user: userId
      });

      if (existingReview) {
        return res.json({ canReview: false, reason: 'Already reviewed' });
      }

      res.json({ canReview: true, orderId: order._id });
    } catch (error) {
      console.error('Can user review error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
};

module.exports = reviewController;