const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Ticket = require('../models/Ticket');
const Category = require('../models/Category');
const Setting = require('../models/Setting'); // Assuming you have this model now
const Notification = require('../models/Notification'); // Assuming you have this model now

const { validationResult } = require('express-validator');
const { extendOrderExpiration } = require('../utils/orderUtils'); // This utility needs to be defined
const fs = require('fs').promises; // For file operations if deleting old images
const path = require('path'); // For path manipulation
const slugify = require('slugify');

// Helper to emit socket events
const emitSocketNotification = (req, event, data) => {
  if (req.app.get('io')) {
    req.app.get('io').emit(event, data);
    console.log(`Socket event emitted: ${event}`, data);
  } else {
    console.warn('Socket.IO instance not found on app object. Cannot emit:', event);
  }
};

const adminController = {
  // Dashboard Statistics - ALREADY WELL IMPLEMENTED (Keep as is, it's quite good)
  getDashboardStats: async (req, res) => {
    try {
      const today = new Date();
      const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
      const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

      const [
        totalUsers,
        newUsersThisMonth,
        totalOrders,
        ordersThisWeek,
        totalRevenueResult, // Renamed to avoid conflict
        revenueThisMonthResult, // Renamed to avoid conflict
        pendingOrders,
        lowStockProducts,
        openTickets,
        recentOrders
      ] = await Promise.all([
        User.countDocuments({ role: 'user' }),
        User.countDocuments({ role: 'user', createdAt: { $gte: thirtyDaysAgo } }),
        Order.countDocuments({ status: { $in: ['confirmed', 'processing', 'shipped', 'delivered'] } }),
        Order.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
        Order.aggregate([
          { $match: { status: { $in: ['confirmed', 'processing', 'shipped', 'delivered'] } } },
          { $group: { _id: null, total: { $sum: '$pricing.total' } } }
        ]),
        Order.aggregate([
          { 
            $match: { 
              status: { $in: ['confirmed', 'processing', 'shipped', 'delivered'] },
              createdAt: { $gte: thirtyDaysAgo }
            } 
          },
          { $group: { _id: null, total: { $sum: '$pricing.total' } } }
        ]),
        Order.countDocuments({ status: 'payment-pending' }),
        Product.countDocuments({ 'inventory.stockStatus': 'low-stock' }),
        Ticket.countDocuments({ status: { $in: ['open', 'in-progress'] } }),
        Order.find({})
          .populate('user', 'name')
          .sort({ createdAt: -1 })
          .limit(5)
          .select('orderNumber pricing.total status createdAt customer')
      ]);

      const stats = {
        users: {
          total: totalUsers,
          newThisMonth: newUsersThisMonth,
          growthRate: totalUsers > 0 ? ((newUsersThisMonth / totalUsers) * 100).toFixed(1) : 0
        },
        orders: {
          total: totalOrders,
          thisWeek: ordersThisWeek,
          pending: pendingOrders
        },
        revenue: {
          total: totalRevenueResult[0]?.total || 0,
          thisMonth: revenueThisMonthResult[0]?.total || 0,
          avgOrderValue: totalOrders > 0 ? ((totalRevenueResult[0]?.total || 0) / totalOrders).toFixed(2) : 0
        },
        products: {
          lowStock: lowStockProducts
        },
        support: {
          openTickets: openTickets
        },
        recentActivity: {
          orders: recentOrders
        }
      };

      res.json({ stats });
    } catch (error) {
      console.error('Get dashboard stats error:', error);
      res.status(500).json({ message: 'Server error', details: error.message });
    }
  },

  // Sales Analytics - ALREADY WELL IMPLEMENTED (Keep as is, it's quite good)
  getSalesAnalytics: async (req, res) => {
    try {
      const { period = '30', startDate, endDate } = req.query;
      
      let start, end;
      if (startDate && endDate) {
        start = new Date(startDate);
        end = new Date(endDate);
      } else {
        end = new Date();
        start = new Date(end.getTime() - parseInt(period) * 24 * 60 * 60 * 1000);
      }

      const dailySales = await Order.aggregate([
        {
          $match: {
            createdAt: { $gte: start, $lte: end },
            status: { $in: ['confirmed', 'processing', 'shipped', 'delivered'] }
          }
        },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            revenue: { $sum: '$pricing.total' },
            orders: { $sum: 1 },
            avgOrderValue: { $avg: '$pricing.total' }
          }
        },
        { $sort: { _id: 1 } }
      ]);

      const statusBreakdown = await Order.aggregate([
        {
          $match: { createdAt: { $gte: start, $lte: end } }
        },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            revenue: { $sum: '$pricing.total' }
          }
        }
      ]);

      const topProducts = await Order.aggregate([
        {
          $match: {
            createdAt: { $gte: start, $lte: end },
            status: { $in: ['confirmed', 'processing', 'shipped', 'delivered'] }
          }
        },
        { $unwind: '$items' },
        {
          $group: {
            _id: '$items.product',
            totalSold: { $sum: '$items.quantity' },
            revenue: { $sum: '$items.totalPrice' }
          }
        },
        {
          $lookup: {
            from: 'products',
            localField: '_id',
            foreignField: '_id',
            as: 'product'
          }
        },
        { $unwind: '$product' },
        { $sort: { revenue: -1 } },
        { $limit: 10 }
      ]);

      res.json({
        dailySales,
        statusBreakdown,
        topProducts,
        period: { start, end }
      });
    } catch (error) {
      console.error('Get sales analytics error:', error);
      res.status(500).json({ message: 'Server error', details: error.message });
    }
  },

  // User Management - ALREADY WELL IMPLEMENTED (Added validation check)
  getAllUsers: async (req, res) => {
    try {
      const { page = 1, limit = 20, search, role, status } = req.query;
      
      const filter = {};
      if (search) {
        filter.$or = [
          { firstName: { $regex: search, $options: 'i' } },
          { lastName: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ];
      }
      if (role) filter.role = role;
      if (status) filter.isActive = status === 'true'; // status from query is string

      const skip = (parseInt(page) - 1) * parseInt(limit);

      const [users, total] = await Promise.all([
        User.find(filter)
          .select('-password -__v -refreshToken') // Exclude sensitive fields
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(parseInt(limit)),
        User.countDocuments(filter)
      ]);

      res.json({
        users,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      });
    } catch (error) {
      console.error('Get all users error:', error);
      res.status(500).json({ message: 'Server error', details: error.message });
    }
  },

  getUserById: async (req, res) => {
    try {
      const { userId } = req.params;
      const user = await User.findById(userId).select('-password -__v -refreshToken');
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.json({ user });
    } catch (error) {
      console.error('Get user by ID error:', error);
      res.status(500).json({ message: 'Server error', details: error.message });
    }
  },

  updateUserStatus: async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
      }

      const { userId } = req.params;
      // Ensure isActive is a boolean
      const isActive = req.body.isActive === true || req.body.isActive === 'true'; 

      const user = await User.findByIdAndUpdate(
        userId,
        { isActive },
        { new: true }
      ).select('-password -__v -refreshToken');

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.json({
        message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
        user
      });
    } catch (error) {
      console.error('Update user status error:', error);
      res.status(500).json({ message: 'Server error', details: error.message });
    }
  },

  updateUserRole: async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
      }

      const { userId } = req.params;
      const { role } = req.body;

      // Basic role validation: ensure it's a valid role if your User model has enum for role
      if (!['user', 'admin', 'editor'].includes(role)) { // Adjust roles as per your User model
        return res.status(400).json({ message: 'Invalid role provided' });
      }

      const user = await User.findByIdAndUpdate(
        userId,
        { role },
        { new: true }
      ).select('-password -__v -refreshToken');

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.json({
        message: `User role updated to ${role} successfully`,
        user
      });
    } catch (error) {
      console.error('Update user role error:', error);
      res.status(500).json({ message: 'Server error', details: error.message });
    }
  },

  // Category Management - Enhanced with image handling & error checking
  getAllCategories: async (req, res) => {
    try {
      const categories = await Category.find({})
        .populate('parent', 'name')
        .sort({ sortOrder: 1, name: 1 });

      const categoryTree = await Category.buildTree(); // This depends on the static method implementation

      res.json({
        categories,
        categoryTree
      });
    } catch (error) {
      console.error('Get categories error:', error);
      res.status(500).json({ message: 'Server error', details: error.message });
    }
  },

  createCategory: async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        // If file was uploaded, delete it due to validation failure
        if (req.file) {
          await fs.unlink(req.file.path);
        }
        return res.status(400).json({ 
          message: 'Validation failed', 
          errors: errors.array() 
        });
      }

      const { name, description, parent, sortOrder, attributes } = req.body;

      // Ensure parent exists if provided
      if (parent) {
        const parentCategory = await Category.findById(parent);
        if (!parentCategory) {
          if (req.file) { await fs.unlink(req.file.path); }
          return res.status(404).json({ message: 'Parent category not found' });
        }
      }

      // Slug is now handled by the model's pre-save hook, but we still need to check uniqueness.
      // This part is crucial: if slugify generates the same slug for two different names,
      // you need a strategy (e.g., adding a unique suffix).
      // For simplicity, we'll check based on the provided 'name' which implies slug uniqueness.
      const existingCategory = await Category.findOne({ name });
      if (existingCategory) {
        if (req.file) { await fs.unlink(req.file.path); }
        return res.status(400).json({ message: 'Category with this name already exists' });
      }

      const categoryData = {
        name,
        description,
        parent: parent || null,
        sortOrder: parseInt(sortOrder) || 0,
        attributes: attributes ? JSON.parse(attributes) : [],
        createdBy: req.user._id // Assuming req.user is set by authentication middleware
      };

      if (req.file) {
        categoryData.image = {
          url: `/uploads/categories/${req.file.filename}`, // Adjust to CDN URL if using cloud storage
          alt: `${name} category image`
        };
      }

      const category = new Category(categoryData);
      await category.save();

      res.status(201).json({
        message: 'Category created successfully',
        category
      });
    } catch (error) {
      console.error('Create category error:', error);
      // Clean up uploaded file if an error occurred before successful save
      if (req.file) {
        await fs.unlink(req.file.path).catch(err => console.error('Error deleting temp file:', err));
      }
      res.status(500).json({ message: 'Server error', details: error.message });
    }
  },

  updateCategory: async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        if (req.file) {
          await fs.unlink(req.file.path);
        }
        return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
      }

      const { categoryId } = req.params;
      const { name, description, parent, sortOrder, attributes } = req.body;

      const category = await Category.findById(categoryId);
      if (!category) {
        if (req.file) { await fs.unlink(req.file.path); }
        return res.status(404).json({ message: 'Category not found' });
      }

      // Check for parent category existence if updated
      if (parent && parent !== category.parent?.toString()) { // Only check if parent actually changed
        const parentCategory = await Category.findById(parent);
        if (!parentCategory) {
          if (req.file) { await fs.unlink(req.file.path); }
          return res.status(404).json({ message: 'New parent category not found' });
        }
        // Prevent setting category as its own parent or a descendant as parent
        let current = parentCategory;
        while (current) {
          if (current._id.equals(categoryId)) {
            if (req.file) { await fs.unlink(req.file.path); }
            return res.status(400).json({ message: 'Cannot set a category as its own parent or descendant' });
          }
          current = await Category.findById(current.parent);
        }
      }

      // Update fields
      if (name && name !== category.name) {
        // The model's pre-save hook will generate a new slug.
        // We still need to check if the new name would result in a duplicate slug.
        const newSlug = slugify(name, { lower: true, strict: true });
        const existingCategoryWithNewSlug = await Category.findOne({ slug: newSlug });
        if (existingCategoryWithNewSlug && !existingCategoryWithNewSlug._id.equals(categoryId)) {
          if (req.file) { await fs.unlink(req.file.path); }
          return res.status(400).json({ message: 'Another category with this name already exists' });
        }
        category.name = name; // Slug will be updated by pre-save hook
      }
      if (description !== undefined) category.description = description;
      if (parent !== undefined) category.parent = parent || null;
      if (sortOrder !== undefined) category.sortOrder = parseInt(sortOrder) || 0;
      if (attributes) category.attributes = JSON.parse(attributes);

      if (req.file) {
        // If an old image existed, attempt to delete it
        if (category.image && category.image.url && !category.image.url.includes('default.png')) {
          const oldImagePath = path.join(__dirname, '..', 'public', category.image.url);
          try {
            await fs.unlink(oldImagePath);
          } catch (err) {
            console.warn(`Could not delete old category image: ${oldImagePath}`, err.message);
            // Don't block the request if old image deletion fails
          }
        }
        category.image = {
          url: `/uploads/categories/${req.file.filename}`, // Adjust to CDN URL if using cloud storage
          alt: `${category.name} category image`
        };
      }

      await category.save();

      res.json({
        message: 'Category updated successfully',
        category
      });
    } catch (error) {
      console.error('Update category error:', error);
      if (req.file) {
        await fs.unlink(req.file.path).catch(err => console.error('Error deleting temp file:', err));
      }
      res.status(500).json({ message: 'Server error', details: error.message });
    }
  },

  deleteCategory: async (req, res) => {
    try {
      const { categoryId } = req.params;

      // Check if category has products
      const productCount = await Product.countDocuments({ category: categoryId });
      if (productCount > 0) {
        return res.status(400).json({ 
          message: 'Cannot delete category that contains products. Please reassign products first.' 
        });
      }

      // Check for subcategories
      const subcategoryCount = await Category.countDocuments({ parent: categoryId });
      if (subcategoryCount > 0) {
          return res.status(400).json({
              message: 'Cannot delete category that has subcategories. Delete or reassign subcategories first.'
          });
      }

      const deletedCategory = await Category.findByIdAndDelete(categoryId);

      if (!deletedCategory) {
        return res.status(404).json({ message: 'Category not found' });
      }

      // Delete associated image file (if not a default image)
      if (deletedCategory.image && deletedCategory.image.url && !deletedCategory.image.url.includes('default.png')) {
        const imagePath = path.join(__dirname, '..', 'public', deletedCategory.image.url);
        try {
          await fs.unlink(imagePath);
        } catch (err) {
          console.warn(`Could not delete category image: ${imagePath}`, err.message);
        }
      }

      res.json({ message: 'Category deleted successfully' });
    } catch (error) {
      console.error('Delete category error:', error);
      res.status(500).json({ message: 'Server error', details: error.message });
    }
  },

  // Product Management - ALREADY WELL IMPLEMENTED
  getLowStockProducts: async (req, res) => {
    try {
      const lowStockProducts = await Product.find({
        'inventory.trackQuantity': true,
        'inventory.quantity': { $lte: 5 } // Assuming 5 is the low stock threshold or you have a field for it
      })
        .populate('category', 'name')
        .sort({ 'inventory.quantity': 1 });

      res.json({ products: lowStockProducts });
    } catch (error) {
      console.error('Get low stock products error:', error);
      res.status(500).json({ message: 'Server error', details: error.message });
    }
  },

  toggleProductFeature: async (req, res) => {
    try {
      const { productId } = req.params;
      // Ensure 'featured' is a boolean
      const featured = req.body.featured === true || req.body.featured === 'true';

      const product = await Product.findByIdAndUpdate(
        productId,
        { featured },
        { new: true }
      ).populate('category', 'name');

      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }

      res.json({
        message: `Product ${featured ? 'featured' : 'unfeatured'} successfully`,
        product
      });
    } catch (error) {
      console.error('Toggle product feature error:', error);
      res.status(500).json({ message: 'Server error', details: error.message });
    }
  },

  getProductPerformance: async (req, res) => {
    try {
      const { period = '30' } = req.query;
      const days = parseInt(period);
      if (isNaN(days) || days <= 0) {
        return res.status(400).json({ message: 'Invalid period for product performance analytics.' });
      }

      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const performance = await Order.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate },
            status: { $in: ['confirmed', 'processing', 'shipped', 'delivered'] }
          }
        },
        { $unwind: '$items' },
        {
          $group: {
            _id: '$items.product',
            totalSold: { $sum: '$items.quantity' },
            revenue: { $sum: '$items.totalPrice' }
          }
        },
        {
          $lookup: {
            from: 'products',
            localField: '_id',
            foreignField: '_id',
            as: 'product'
          }
        },
        { $unwind: '$product' },
        { $sort: { revenue: -1, totalSold: -1 } }, // Sort by revenue then totalSold
        { $limit: 20 }
      ]);

      res.json({ performance });
    } catch (error) {
      console.error('Get product performance error:', error);
      res.status(500).json({ message: 'Server error', details: error.message });
    }
  },

  getProductAnalytics: async (req, res) => {
    try {
      const totalProducts = await Product.countDocuments({ status: 'active' });
      const lowStockCount = await Product.countDocuments({ 'inventory.stockStatus': 'low-stock' });
      const outOfStockCount = await Product.countDocuments({ 'inventory.stockStatus': 'out-of-stock' });
      const totalCategories = await Category.countDocuments({});

      res.json({
        totalProducts,
        lowStockCount,
        outOfStockCount,
        totalCategories // Added this for more product analytics
      });
    } catch (error) {
      console.error('Get product analytics error:', error);
      res.status(500).json({ message: 'Server error', details: error.message });
    }
  },

  // Order Management - ALREADY WELL IMPLEMENTED
  getPendingPaymentOrders: async (req, res) => {
    try {
      const pendingOrders = await Order.find({
        status: 'payment-pending'
      })
        .populate('user', 'firstName lastName email')
        .sort({ createdAt: -1 });

      const ordersWithTimeRemaining = pendingOrders.map(order => {
        const orderObj = order.toObject();
        // Assuming order.timeUntilExpiration is a virtual or method on your Order model
        // that calculates remaining milliseconds.
        const timeRemainingMs = order.timeUntilExpiration; 
        const hoursRemaining = Math.max(0, Math.floor(timeRemainingMs / (1000 * 60 * 60)));
        return {
          ...orderObj,
          timeRemaining: timeRemainingMs, // Raw milliseconds
          hoursRemaining: hoursRemaining
        };
      });

      res.json({ orders: ordersWithTimeRemaining });
    } catch (error) {
      console.error('Get pending payment orders error:', error);
      res.status(500).json({ message: 'Server error', details: error.message });
    }
  },

  extendOrderExpiration: async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
      }
      
      const { orderId } = req.params;
      const { reason, hoursToAdd = 24 } = req.body; // Default to 24 hours extension

      if (isNaN(hoursToAdd) || hoursToAdd <= 0) {
        return res.status(400).json({ message: 'hoursToAdd must be a positive number.' });
      }

      // This `extendOrderExpiration` utility is critical and needs to be robust.
      // It should update the order's expiresAt field.
      const order = await extendOrderExpiration(orderId, reason, hoursToAdd); 

      if (!order) {
        return res.status(404).json({ message: 'Order not found or not eligible for extension' });
      }

      // Emit a socket event for real-time update
      emitSocketNotification(req, 'orderExpirationExtended', { 
        orderId: order._id, 
        newExpiration: order.expiresAt,
        message: `Order #${order.orderNumber} expiration extended by ${hoursToAdd} hours.`
      });

      // Also create a persistent notification for admin
      await Notification.create({
        recipient: 'admin',
        type: 'order-update',
        message: `Order #${order.orderNumber} expiration extended by ${hoursToAdd} hours. Reason: ${reason || 'Not provided'}.`,
        link: `/admin/orders/${order._id}`,
        metadata: { orderId: order._id, action: 'expiration-extended' }
      });

      res.json({
        message: 'Order expiration extended successfully',
        order
      });
    } catch (error) {
      console.error('Extend order expiration error:', error);
      res.status(500).json({ message: error.message || 'Server error', details: error.message });
    }
  },

  getRecentOrders: async (req, res) => {
    try {
      const { limit = 10, status } = req.query;

      const filter = {};
      if (status) filter.status = status;

      const orders = await Order.find(filter)
        .populate('user', 'firstName lastName')
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .select('orderNumber pricing.total status createdAt customer');

      res.json({ orders });
    } catch (error) {
      console.error('Get recent orders error:', error);
      res.status(500).json({ message: 'Server error', details: error.message });
    }
  },

  // Inventory Management - Enhanced with better alerts and notifications
  getInventoryAlerts: async (req, res) => {
    try {
      const alerts = await Product.find({
        $or: [
          { 'inventory.stockStatus': 'low-stock' },
          { 'inventory.stockStatus': 'out-of-stock' }
          // If you have variants and want alerts per variant:
          // { 'variants.quantity': { $lte: 5 } } would need to be handled carefully
          // e.g., Product.find({ 'variants.some(v => v.quantity <= v.lowStockThreshold)' })
          // For simplicity here, we rely on the main product's stockStatus.
        ]
      })
        .populate('category', 'name')
        .select('name sku inventory.quantity inventory.stockStatus category');

      res.json({ alerts });
    } catch (error) {
      console.error('Get inventory alerts error:', error);
      res.status(500).json({ message: 'Server error', details: error.message });
    }
  },

  bulkUpdateInventory: async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
      }

      const { updates } = req.body;
      const results = [];
      const io = req.app.get('io'); // Get Socket.IO instance

      for (const update of updates) {
        try {
          if (!update.productId || typeof update.quantity !== 'number' || update.quantity < 0) {
            results.push({
              productId: update.productId,
              success: false,
              error: 'Invalid update data (productId or quantity invalid).'
            });
            continue;
          }

          const product = await Product.findById(update.productId);

          if (!product) {
            results.push({
              productId: update.productId,
              success: false,
              error: 'Product not found'
            });
            continue;
          }

          // Update main inventory quantity
          if (product.inventory && product.inventory.trackQuantity) {
            product.inventory.quantity = update.quantity;
            // Re-evaluate stockStatus based on new quantity and thresholds (if defined in Product model)
            if (product.inventory.quantity === 0) {
                product.inventory.stockStatus = 'out-of-stock';
            } else if (product.inventory.quantity <= product.inventory.lowStockThreshold) { // Assuming lowStockThreshold exists
                product.inventory.stockStatus = 'low-stock';
            } else {
                product.inventory.stockStatus = 'in-stock';
            }
          }
          // If variants exist, you'd need to loop through them and update based on update.variantId
          // Example for variants (assuming update.variantId is passed):
          // if (update.variantId && product.variants) {
          //   const variant = product.variants.id(update.variantId);
          //   if (variant) {
          //     variant.quantity = update.quantity;
          //     // Update variant-specific stock status
          //   } else {
          //     throw new Error('Variant not found');
          //   }
          // }

          await product.save();

          results.push({
            productId: update.productId,
            success: true,
            newQuantity: product.inventory.quantity,
            newStockStatus: product.inventory.stockStatus
          });
          
          // Emit socket event for inventory update
          if (io) {
            io.emit('inventoryUpdate', { 
              productId: product._id, 
              newQuantity: product.inventory.quantity,
              stockStatus: product.inventory.stockStatus,
              message: `${product.name} stock updated to ${product.inventory.quantity}`
            });
          }

          // Create a persistent notification if stock is low/out
          if (product.inventory.stockStatus === 'low-stock' || product.inventory.stockStatus === 'out-of-stock') {
            await Notification.create({
              recipient: 'admin',
              type: 'low-stock',
              message: `${product.name} is now ${product.inventory.stockStatus} (${product.inventory.quantity} units).`,
              link: `/admin/products/${product._id}`,
              metadata: { productId: product._id, stockStatus: product.inventory.stockStatus }
            });
          }

        } catch (error) {
          results.push({
            productId: update.productId,
            success: false,
            error: error.message
          });
        }
      }

      res.json({
        message: 'Bulk inventory update completed',
        results
      });
    } catch (error) {
      console.error('Bulk update inventory error:', error);
      res.status(500).json({ message: 'Server error', details: error.message });
    }
  },

  // Support Overview - ALREADY WELL IMPLEMENTED
  getSupportOverview: async (req, res) => {
    try {
      const [
        totalTickets,
        openTickets,
        avgResponseTimeResult, // Renamed to avoid conflict
        ticketsByPriority,
        ticketsByCategory,
        recentTickets
      ] = await Promise.all([
        Ticket.countDocuments({}),
        Ticket.countDocuments({ status: { $in: ['open', 'in-progress'] } }),
        Ticket.aggregate([
          { $match: { 'messages.1': { $exists: true } } }, // Ensures at least one response exists
          {
            $addFields: {
              responseTime: {
                $subtract: [
                  { $arrayElemAt: ['$messages.createdAt', 1] }, // Timestamp of first response (assuming index 1 is first agent response)
                  { $arrayElemAt: ['$messages.createdAt', 0] }  // Timestamp of initial message (from customer)
                ]
              }
            }
          },
          { $group: { _id: null, avgResponseTime: { $avg: '$responseTime' } } }
        ]),
        Ticket.aggregate([
          { $group: { _id: '$priority', count: { $sum: 1 } } }
        ]),
        Ticket.aggregate([
          { $group: { _id: '$category', count: { $sum: 1 } } }
        ]),
        Ticket.find({})
          .sort({ lastActivityAt: -1 })
          .limit(10)
          .select('ticketNumber subject status priority lastActivityAt customer')
      ]);

      res.json({
        overview: {
          totalTickets,
          openTickets,
          avgResponseTime: avgResponseTimeResult[0]?.avgResponseTime ? (avgResponseTimeResult[0].avgResponseTime / (1000 * 60 * 60)).toFixed(2) : 0, // In hours
          ticketsByPriority,
          ticketsByCategory
        },
        recentTickets
      });
    } catch (error) {
      console.error('Get support overview error:', error);
      res.status(500).json({ message: 'Server error', details: error.message });
    }
  },

  // Analytics and Reports - Expanded for actual data/export logic
  getTrafficAnalytics: async (req, res) => {
    try {
      // For a *full* implementation, this would integrate with a real analytics service
      // like Google Analytics API, Mixpanel, etc.
      // E.g., using `google-analytics-data` library:
      // const { betaAnalyticsDataClient } = require('@google-analytics/data');
      // const analyticsDataClient = new betaAnalyticsDataClient();
      // const [response] = await analyticsDataClient.runReport({ ... });
      // For now, it remains illustrative or uses more advanced mock patterns.

      const { period = '7' } = req.query; // e.g., '7', '30', '90', '365'
      const days = parseInt(period);
      if (isNaN(days) || days <= 0) {
        return res.status(400).json({ message: 'Invalid period for traffic analytics.' });
      }

      const today = new Date();
      const trafficData = [];
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        const dateString = date.toISOString().split('T')[0];
        trafficData.push({
          date: dateString,
          pageViews: Math.floor(Math.random() * 2000) + 500,
          uniqueVisitors: Math.floor(Math.random() * 1000) + 200,
          bounceRate: (Math.random() * 20 + 30).toFixed(1), // 30-50%
          avgSessionDuration: (Math.random() * 180 + 60).toFixed(0), // 60-240 seconds
        });
      }

      res.json({ 
        traffic: {
          summary: { // Aggregate summary for the period
            pageViews: trafficData.reduce((sum, item) => sum + item.pageViews, 0),
            uniqueVisitors: trafficData.reduce((sum, item) => sum + item.uniqueVisitors, 0),
            bounceRate: (trafficData.reduce((sum, item) => sum + parseFloat(item.bounceRate), 0) / trafficData.length).toFixed(1),
            avgSessionDuration: (trafficData.reduce((sum, item) => sum + parseFloat(item.avgSessionDuration), 0) / trafficData.length).toFixed(0),
          },
          dailyData: trafficData // Detailed daily data
        }
      });
    } catch (error) {
      console.error('Get traffic analytics error:', error);
      res.status(500).json({ message: 'Server error', details: error.message });
    }
  },

  getSalesReport: async (req, res) => {
    try {
      const { startDate, endDate, groupBy = 'month' } = req.query;
      const start = startDate ? new Date(startDate) : new Date('2023-01-01T00:00:00Z');
      const end = endDate ? new Date(endDate) : new Date();

      if (start > end) {
        return res.status(400).json({ message: 'Start date cannot be after end date.' });
      }

      let formatString;
      if (groupBy === 'day') formatString = '%Y-%m-%d';
      else if (groupBy === 'week') formatString = '%Y-%W'; // ISO week number
      else if (groupBy === 'month') formatString = '%Y-%m';
      else if (groupBy === 'year') formatString = '%Y';
      else return res.status(400).json({ message: 'Invalid groupBy parameter. Must be day, week, month, or year.' });

      const salesData = await Order.aggregate([
        {
          $match: {
            createdAt: { $gte: start, $lte: end },
            status: { $in: ['confirmed', 'processing', 'shipped', 'delivered'] }
          }
        },
        {
          $group: {
            _id: { $dateToString: { format: formatString, date: '$createdAt' } },
            totalRevenue: { $sum: '$pricing.total' },
            totalOrders: { $sum: 1 },
            avgOrderValue: { $avg: '$pricing.total' }
          }
        },
        { $sort: { _id: 1 } }
      ]);

      res.json({ report: salesData, type: 'sales', period: { start, end }, groupBy });
    } catch (error) {
      console.error('Get sales report error:', error);
      res.status(500).json({ message: 'Server error', details: error.message });
    }
  },

  getCustomerReport: async (req, res) => {
    try {
      const { topN = 10, minOrders = 1, period = 'all' } = req.query; // 'all', '30', '90' etc.
      const limit = parseInt(topN);
      const minOrderCount = parseInt(minOrders);

      if (isNaN(limit) || limit <= 0 || isNaN(minOrderCount) || minOrderCount < 0) {
        return res.status(400).json({ message: 'Invalid topN or minOrders parameters.' });
      }

      let matchOrders = { status: { $in: ['confirmed', 'processing', 'shipped', 'delivered'] } };
      if (period !== 'all') {
        const days = parseInt(period);
        if (isNaN(days) || days <= 0) {
          return res.status(400).json({ message: 'Invalid period for customer report.' });
        }
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        matchOrders.createdAt = { $gte: startDate };
      }

      const customerReport = await Order.aggregate([
        { $match: matchOrders },
        {
          $group: {
            _id: '$user', // Group by user ID
            totalOrders: { $sum: 1 },
            totalSpent: { $sum: '$pricing.total' },
            firstOrderDate: { $min: '$createdAt' },
            lastOrderDate: { $max: '$createdAt' }
          }
        },
        { $match: { totalOrders: { $gte: minOrderCount } } },
        { $sort: { totalSpent: -1 } },
        { $limit: limit },
        {
          $lookup: {
            from: 'users', // The name of your users collection
            localField: '_id',
            foreignField: '_id',
            as: 'customerDetails'
          }
        },
        { $unwind: '$customerDetails' },
        {
          $project: {
            _id: 0,
            userId: '$_id',
            firstName: '$customerDetails.firstName',
            lastName: '$customerDetails.lastName',
            email: '$customerDetails.email',
            totalOrders: 1,
            totalSpent: 1,
            firstOrderDate: 1,
            lastOrderDate: 1
          }
        }
      ]);

      res.json({ report: customerReport, type: 'customers' });
    } catch (error) {
      console.error('Get customer report error:', error);
      res.status(500).json({ message: 'Server error', details: error.message });
    }
  },

  getProductReport: async (req, res) => {
    try {
      const { topN = 10, period = '30', sortBy = 'totalSold' } = req.query;
      const limit = parseInt(topN);
      const days = parseInt(period);

      if (isNaN(limit) || limit <= 0 || isNaN(days) || days <= 0) {
        return res.status(400).json({ message: 'Invalid topN or period parameters.' });
      }
      if (!['totalSold', 'totalRevenue'].includes(sortBy)) {
        return res.status(400).json({ message: 'Invalid sortBy parameter. Must be totalSold or totalRevenue.' });
      }

      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const sortStage = {};
      sortStage[sortBy] = -1; // Descending order for top N

      const productReport = await Order.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate },
            status: { $in: ['confirmed', 'processing', 'shipped', 'delivered'] }
          }
        },
        { $unwind: '$items' },
        {
          $group: {
            _id: '$items.product',
            totalSold: { $sum: '$items.quantity' },
            totalRevenue: { $sum: '$items.totalPrice' },
            averagePrice: { $avg: '$items.price' }
          }
        },
        {
          $lookup: {
            from: 'products',
            localField: '_id',
            foreignField: '_id',
            as: 'productDetails'
          }
        },
        { $unwind: '$productDetails' },
        { $sort: sortStage }, // Apply dynamic sort
        { $limit: limit },
        {
          $project: {
            _id: 0,
            productId: '$_id',
            name: '$productDetails.name',
            sku: '$productDetails.sku',
            totalSold: 1,
            totalRevenue: 1,
            averagePrice: { $round: ['$averagePrice', 2] } // Round to 2 decimal places
          }
        }
      ]);

      res.json({ report: productReport, type: 'products', period: { startDate, endDate: new Date() } });
    } catch (error) {
      console.error('Get product report error:', error);
      res.status(500).json({ message: 'Server error', details: error.message });
    }
  },

  exportReport: async (req, res) => {
    try {
      const { type } = req.params;
      const { startDate, endDate, ...otherParams } = req.query; // Capture other query params for specific reports

      let dataToExport;
      let filename = `${type}_report_${new Date().toISOString().split('T')[0]}.csv`;
      let headers = [];

      // Re-use existing report logic to fetch data
      if (type === 'sales') {
        const salesDataResponse = await adminController.getSalesReport({ query: { startDate, endDate, ...otherParams } }, { json: (data) => data });
        dataToExport = salesDataResponse.report;
        headers = ['Period', 'Total Revenue', 'Total Orders', 'Avg Order Value'];
        // Reformat for CSV
        dataToExport = dataToExport.map(item => ({
          Period: item._id,
          'Total Revenue': item.totalRevenue.toFixed(2),
          'Total Orders': item.totalOrders,
          'Avg Order Value': item.avgOrderValue.toFixed(2)
        }));
      } else if (type === 'customers') {
        const customerDataResponse = await adminController.getCustomerReport({ query: { ...otherParams } }, { json: (data) => data });
        dataToExport = customerDataResponse.report;
        headers = ['First Name', 'Last Name', 'Email', 'Total Orders', 'Total Spent', 'First Order Date', 'Last Order Date'];
        // Reformat for CSV
        dataToExport = dataToExport.map(item => ({
          'First Name': item.firstName,
          'Last Name': item.lastName,
          'Email': item.email,
          'Total Orders': item.totalOrders,
          'Total Spent': item.totalSpent.toFixed(2),
          'First Order Date': item.firstOrderDate.toISOString().split('T')[0],
          'Last Order Date': item.lastOrderDate.toISOString().split('T')[0]
        }));
      } else if (type === 'products') {
        const productDataResponse = await adminController.getProductReport({ query: { startDate, endDate, ...otherParams } }, { json: (data) => data });
        dataToExport = productDataResponse.report;
        headers = ['Product Name', 'SKU', 'Total Sold', 'Total Revenue', 'Average Price'];
        // Reformat for CSV
        dataToExport = dataToExport.map(item => ({
          'Product Name': item.name,
          'SKU': item.sku || 'N/A',
          'Total Sold': item.totalSold,
          'Total Revenue': item.totalRevenue.toFixed(2),
          'Average Price': item.averagePrice.toFixed(2)
        }));
      } else {
        return res.status(400).json({ message: 'Invalid report type for export.' });
      }

      // Use a CSV library for robust CSV generation
      const { stringify } = require('csv-stringify'); // npm install csv-stringify

      stringify(dataToExport, { header: true, columns: headers }, (err, csvContent) => {
        if (err) {
          console.error('CSV stringify error:', err);
          return res.status(500).json({ message: 'Error generating CSV report.', details: err.message });
        }

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.status(200).send(csvContent);
      });

    } catch (error) {
      console.error('Export report error:', error);
      res.status(500).json({ message: 'Server error', details: error.message });
    }
  },

  // Settings and Configuration - Fully implemented using a `Setting` model
  getSettings: async (req, res) => {
    try {
      // Find the single settings document. If it doesn't exist, return sensible defaults.
      let settings = await Setting.findOne({});
      if (!settings) {
        settings = await Setting.create({}); // Create a default settings document
        // Or simply return default values without saving to DB if you prefer.
        // settings = { siteName: 'Fenkparet', currency: 'USD', shippingRate: 5.00, taxRate: 0.08, freeShippingThreshold: 100.00 };
      }
      res.json({ settings });
    } catch (error) {
      console.error('Get settings error:', error);
      res.status(500).json({ message: 'Server error', details: error.message });
    }
  },

  updateSettings: async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
      }

      const updateData = req.body;
      
      // Basic validation for rates/thresholds
      if (updateData.shippingRate !== undefined) updateData.shippingRate = parseFloat(updateData.shippingRate);
      if (updateData.taxRate !== undefined) updateData.taxRate = parseFloat(updateData.taxRate);
      if (updateData.freeShippingThreshold !== undefined) updateData.freeShippingThreshold = parseFloat(updateData.freeShippingThreshold);

      // Find the single settings document and update it. `upsert: true` creates if not found.
      const settings = await Setting.findOneAndUpdate(
        {}, // Filter to find any document (assuming only one settings document)
        { $set: updateData }, // Use $set to update only provided fields
        { new: true, upsert: true, runValidators: true } // Return new doc, create if not found, run schema validators
      );

      // Emit a notification if certain critical settings change (e.g., maintenance mode)
      if (updateData.maintenanceMode !== undefined) {
          const status = updateData.maintenanceMode ? 'enabled' : 'disabled';
          emitSocketNotification(req, 'systemStatusUpdate', {
              type: 'maintenance-mode',
              status: status,
              message: `Maintenance mode has been ${status}.`
          });
          await Notification.create({
            recipient: 'admin',
            type: 'system-alert',
            message: `System maintenance mode ${status}.`,
            metadata: { maintenanceMode: updateData.maintenanceMode }
          });
      }

      res.json({ message: 'Settings updated successfully', settings });
    } catch (error) {
      console.error('Update settings error:', error);
      res.status(500).json({ message: 'Server error', details: error.message });
    }
  },

  // Notifications - Fully implemented using a `Notification` model
  getNotifications: async (req, res) => {
    try {
      const { page = 1, limit = 20, isRead, type } = req.query;

      const filter = { recipient: 'admin' }; // Or req.user._id if notifications are per admin user
      if (isRead !== undefined) filter.isRead = isRead === 'true';
      if (type) filter.type = type;

      const skip = (parseInt(page) - 1) * parseInt(limit);

      const [notifications, total] = await Promise.all([
        Notification.find(filter)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(parseInt(limit)),
        Notification.countDocuments(filter)
      ]);

      res.json({
        notifications,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      });
    } catch (error) {
      console.error('Get notifications error:', error);
      res.status(500).json({ message: 'Server error', details: error.message });
    }
  },

  markNotificationRead: async (req, res) => {
    try {
      const { notificationId } = req.params;
      const notification = await Notification.findByIdAndUpdate(
        notificationId,
        { isRead: true, readAt: new Date() },
        { new: true }
      );

      if (!notification) {
        return res.status(404).json({ message: 'Notification not found' });
      }

      res.json({ message: 'Notification marked as read', notification });
    } catch (error) {
      console.error('Mark notification read error:', error);
      res.status(500).json({ message: 'Server error', details: error.message });
    }
  },

  deleteNotification: async (req, res) => {
    try {
      const { notificationId } = req.params;
      const deletedNotification = await Notification.findByIdAndDelete(notificationId);

      if (!deletedNotification) {
        return res.status(404).json({ message: 'Notification not found' });
      }

      res.json({ message: 'Notification deleted successfully' });
    } catch (error) {
      console.error('Delete notification error:', error);
      res.status(500).json({ message: 'Server error', details: error.message });
    }
  },

  // System Health and Logs - Enhanced for actual system metrics and illustrative log fetching
  getSystemHealth: async (req, res) => {
    try {
      const os = require('os'); // Node.js built-in OS module

      const freeMemoryMB = (os.freemem() / (1024 * 1024)).toFixed(2);
      const totalMemoryMB = (os.totalmem() / (1024 * 1024)).toFixed(2);
      const cpuLoad = os.loadavg(); // Returns array [1m, 5m, 15m average load]

      // You would typically have real checks for external services:
      // const dbStatus = await mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
      // const emailServiceStatus = await checkEmailService(); // Custom function to ping email service
      // const storageServiceStatus = await checkStorageService(); // Custom function to ping cloud storage

      const health = {
        status: 'healthy', // Determine overall health based on checks
        timestamp: new Date(),
        system: {
          platform: os.platform(),
          architecture: os.arch(),
          uptime: os.uptime(), // System uptime in seconds
          cpuCores: os.cpus().length,
          totalMemoryMB: parseFloat(totalMemoryMB),
          freeMemoryMB: parseFloat(freeMemoryMB),
          cpuLoadAverage: cpuLoad,
        },
        application: {
          uptime: process.uptime(), // Node.js process uptime
          memoryUsage: process.memoryUsage(), // { rss, heapTotal, heapUsed, external, arrayBuffers }
          cpuUsage: process.cpuUsage(), // { user, system }
          nodejsVersion: process.version,
          environment: process.env.NODE_ENV,
        },
        services: {
          database: 'connected', // Replace with actual DB connection check
          email: 'operational', // Replace with actual email service check
          storage: 'operational' // Replace with actual storage service check
        }
      };

      // Add a simple logic to set overall status
      if (health.services.database === 'disconnected' || health.services.email !== 'operational') {
        health.status = 'degraded';
      }
      // You can add more complex logic for CPU, memory thresholds etc.

      res.json({ health });
    } catch (error) {
      console.error('Get system health error:', error);
      res.status(500).json({ message: 'Server error', details: error.message });
    }
  },

  getSystemLogs: async (req, res) => {
    try {
      // For a truly functional log retrieval, you'd integrate with:
      // 1. A centralized logging service (e.g., ELK Stack, Splunk, Datadog Logs)
      // 2. A file-based logging system (e.g., `winston` or `morgan` logs to files, then read the files)
      // 3. A database where logs are stored (e.g., a `Log` Mongoose model)

      // Example using a simple file read for logs (requires log file to exist)
      const logFilePath = path.join(__dirname, '..', 'app.log'); // Adjust if your logs are elsewhere
      const { limit = 100, level, search } = req.query; // Query params for filtering

      let logContent = '';
      try {
        logContent = await fs.readFile(logFilePath, 'utf8');
      } catch (readError) {
        if (readError.code === 'ENOENT') {
          return res.status(200).json({ logs: [], message: 'Log file not found. Ensure logging is configured.' });
        }
        throw readError; // Re-throw other errors
      }

      const logLines = logContent.split('\n').filter(line => line.trim() !== '');

      let filteredLogs = logLines.map(line => {
        // Attempt to parse a common log format (e.g., from winston or similar)
        // This regex is a simple example, adjust based on your actual log format
        const match = line.match(/^\[(.*?)\] \[(\w+)\] (.*)$/);
        if (match) {
          return { timestamp: match[1], level: match[2], message: match[3], raw: line };
        }
        return { timestamp: 'N/A', level: 'UNKNOWN', message: line, raw: line };
      });

      if (level) {
        filteredLogs = filteredLogs.filter(log => log.level.toLowerCase() === level.toLowerCase());
      }
      if (search) {
        filteredLogs = filteredLogs.filter(log => log.message.toLowerCase().includes(search.toLowerCase()) || log.raw.toLowerCase().includes(search.toLowerCase()));
      }

      // Reverse to get most recent first, then apply limit
      filteredLogs.reverse();
      const paginatedLogs = filteredLogs.slice(0, parseInt(limit));

      res.json({ logs: paginatedLogs });
    } catch (error) {
      console.error('Get system logs error:', error);
      res.status(500).json({ message: 'Server error', details: error.message });
    }
  }
};

module.exports = adminController;