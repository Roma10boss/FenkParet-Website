// middleware/admin.js
const User = require('../models/User');

// Enhanced admin middleware with proper role checking
const requireAdmin = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Get full user object from database to ensure we have latest role info
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account is deactivated'
      });
    }

    // Check admin status (supports both isAdmin boolean and role string)
    const isUserAdmin = user.isAdmin || user.role === 'admin';
    if (!isUserAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Admin privileges required. Current role: ' + (user.role || 'user')
      });
    }

    // Update req.user with complete admin info
    req.user = {
      ...req.user,
      isAdmin: true,
      role: 'admin',
      fullUser: user
    };

    next();
  } catch (error) {
    console.error('Admin middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during authorization'
    });
  }
};

// Middleware to check if user has permission for specific resource
const requireAdminOrOwner = (resourceUserIdField = 'userId') => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      // Get user from database
      const user = await User.findById(req.user.userId);
      if (!user || !user.isActive) {
        return res.status(401).json({
          success: false,
          message: 'User not found or inactive'
        });
      }

      // Check if user is admin
      const isUserAdmin = user.isAdmin || user.role === 'admin';
      if (isUserAdmin) {
        req.user.isAdmin = true;
        req.user.role = 'admin';
        return next();
      }

      // Check if user owns the resource
      const resourceUserId = req.params[resourceUserIdField] || req.body[resourceUserIdField];
      if (resourceUserId && resourceUserId === req.user.userId.toString()) {
        return next();
      }

      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges or resource ownership required.'
      });
    } catch (error) {
      console.error('Admin or owner middleware error:', error);
      return res.status(500).json({
        success: false,
        message: 'Server error during authorization'
      });
    }
  };
};

module.exports = {
  requireAdmin,
  requireAdminOrOwner
};