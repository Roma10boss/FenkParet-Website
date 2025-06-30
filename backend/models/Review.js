const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxLength: 100
  },
  comment: {
    type: String,
    required: true,
    trim: true,
    maxLength: 1000
  },
  images: [{
    url: String,
    alt: String
  }],
  verified: {
    type: Boolean,
    default: false
  },
  helpful: {
    yes: {
      type: Number,
      default: 0
    },
    no: {
      type: Number,
      default: 0
    },
    users: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      vote: {
        type: String,
        enum: ['yes', 'no']
      }
    }]
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  adminNotes: {
    type: String,
    trim: true
  },
  response: {
    text: String,
    respondedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    respondedAt: Date
  }
}, {
  timestamps: true
});

// Indexes
reviewSchema.index({ product: 1, status: 1 });
reviewSchema.index({ user: 1 });
reviewSchema.index({ rating: 1 });
reviewSchema.index({ createdAt: -1 });
reviewSchema.index({ product: 1, user: 1 }, { unique: true }); // One review per user per product

// Virtual for checking if review is helpful
reviewSchema.virtual('helpfulnessRatio').get(function() {
  const total = this.helpful.yes + this.helpful.no;
  return total > 0 ? (this.helpful.yes / total) * 100 : 0;
});

// Method to check if user has voted on helpfulness
reviewSchema.methods.hasUserVoted = function(userId) {
  return this.helpful.users.some(vote => vote.user.toString() === userId.toString());
};

// Method to get user's vote
reviewSchema.methods.getUserVote = function(userId) {
  const vote = this.helpful.users.find(vote => vote.user.toString() === userId.toString());
  return vote ? vote.vote : null;
};

// Static method to calculate product rating statistics
reviewSchema.statics.getProductRatingStats = async function(productId) {
  const stats = await this.aggregate([
    {
      $match: {
        product: mongoose.Types.ObjectId(productId),
        status: 'approved'
      }
    },
    {
      $group: {
        _id: '$rating',
        count: { $sum: 1 }
      }
    }
  ]);

  const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  let totalReviews = 0;
  let totalRating = 0;

  stats.forEach(stat => {
    ratingDistribution[stat._id] = stat.count;
    totalReviews += stat.count;
    totalRating += stat._id * stat.count;
  });

  const averageRating = totalReviews > 0 ? totalRating / totalReviews : 0;

  return {
    averageRating: Math.round(averageRating * 10) / 10,
    totalReviews,
    ratingDistribution
  };
};

// Pre-save middleware to verify purchase
reviewSchema.pre('save', async function(next) {
  if (this.isNew) {
    const Order = mongoose.model('Order');
    
    // Check if user has purchased this product
    const order = await Order.findOne({
      _id: this.order,
      user: this.user,
      'items.product': this.product,
      status: { $in: ['delivered', 'completed'] }
    });

    if (order) {
      this.verified = true;
    }
  }
  next();
});

// Post-save middleware to update product rating
reviewSchema.post('save', async function(doc) {
  if (doc.status === 'approved') {
    const Product = mongoose.model('Product');
    const stats = await this.constructor.getProductRatingStats(doc.product);
    
    await Product.findByIdAndUpdate(doc.product, {
      'ratings.average': stats.averageRating,
      'ratings.count': stats.totalReviews
    });
  }
});

// Post-remove middleware to update product rating
reviewSchema.post('remove', async function(doc) {
  const Product = mongoose.model('Product');
  const stats = await this.constructor.getProductRatingStats(doc.product);
  
  await Product.findByIdAndUpdate(doc.product, {
    'ratings.average': stats.averageRating,
    'ratings.count': stats.totalReviews
  });
});

module.exports = mongoose.model('Review', reviewSchema);