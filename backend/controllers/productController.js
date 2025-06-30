const Product = require('../models/Product');
const Category = require('../models/Category');
const { validationResult } = require('express-validator');
const { notifications } = require('../utils/socket');

const productController = {
  // Get all products with filters and pagination
  getAllProducts: async (req, res) => {
    try {
      const {
        page = 1,
        limit = 12,
        category,
        search,
        minPrice,
        maxPrice,
        status = 'active',
        sortBy = 'createdAt',
        sortOrder = 'desc',
        featured
      } = req.query;

      // Build filter object
      const filter = { status };

      if (category) {
        filter.category = category;
      }

      if (search) {
        filter.$or = [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { shortDescription: { $regex: search, $options: 'i' } },
          { tags: { $in: [new RegExp(search, 'i')] } },
          { sku: { $regex: search, $options: 'i' } },
          { barcode: { $regex: search, $options: 'i' } }
        ];
      }

      if (minPrice || maxPrice) {
        filter.price = {};
        if (minPrice) filter.price.$gte = parseFloat(minPrice);
        if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
      }

      if (featured === 'true') {
        filter.featured = true;
      }

      // Build sort object
      const sort = {};
      sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

      // Execute query with pagination
      const skip = (parseInt(page) - 1) * parseInt(limit);
      
      const [products, total] = await Promise.all([
        Product.find(filter)
          .populate('category', 'name slug')
          .populate('createdBy', 'name')
          .sort(sort)
          .skip(skip)
          .limit(parseInt(limit)),
        Product.countDocuments(filter)
      ]);

      res.json({
        products,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      });
    } catch (error) {
      console.error('Get products error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  // Get product by ID
  getProductById: async (req, res) => {
    try {
      const product = await Product.findById(req.params.id)
        .populate('category', 'name slug')
        .populate('createdBy', 'name');

      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }

      res.json({ product });
    } catch (error) {
      console.error('Get product error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  // Create new product (Admin only)
  createProduct: async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          message: 'Validation failed', 
          errors: errors.array() 
        });
      }

      const {
        name,
        description,
        shortDescription,
        category,
        price,
        comparePrice,
        cost,
        sku,
        barcode,
        weight,
        dimensions,
        variants,
        tags,
        featured,
        inventory,
        seo
      } = req.body;

      // Process uploaded images
      const images = [];
      if (req.files && req.files.length > 0) {
        req.files.forEach((file, index) => {
          images.push({
            url: `/uploads/products/${file.filename}`,
            alt: `${name} - Image ${index + 1}`,
            isPrimary: index === 0
          });
        });
      }

      const product = new Product({
        name,
        description,
        shortDescription,
        category,
        price: parseFloat(price),
        comparePrice: comparePrice ? parseFloat(comparePrice) : undefined,
        cost: cost ? parseFloat(cost) : undefined,
        sku,
        barcode,
        weight: weight ? parseFloat(weight) : undefined,
        dimensions: dimensions ? JSON.parse(dimensions) : undefined,
        images,
        variants: variants ? JSON.parse(variants) : [],
        tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
        featured: featured === 'true',
        inventory: inventory ? JSON.parse(inventory) : {},
        seo: seo ? JSON.parse(seo) : {},
        createdBy: req.user._id,
        status: 'active'
      });

      await product.save();

      // Populate category for response
      await product.populate('category', 'name slug');

      res.status(201).json({
        message: 'Product created successfully',
        product
      });
    } catch (error) {
      console.error('Create product error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  // Update product (Admin only)
  updateProduct: async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          message: 'Validation failed', 
          errors: errors.array() 
        });
      }

      const product = await Product.findById(req.params.id);
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }

      const {
        name,
        description,
        shortDescription,
        category,
        price,
        comparePrice,
        cost,
        sku,
        barcode,
        weight,
        dimensions,
        variants,
        tags,
        featured,
        inventory,
        seo,
        status
      } = req.body;

      // Update fields
      if (name) product.name = name;
      if (description) product.description = description;
      if (shortDescription) product.shortDescription = shortDescription;
      if (category) product.category = category;
      if (price) product.price = parseFloat(price);
      if (comparePrice !== undefined) product.comparePrice = comparePrice ? parseFloat(comparePrice) : undefined;
      if (cost !== undefined) product.cost = cost ? parseFloat(cost) : undefined;
      if (sku) product.sku = sku;
      if (barcode) product.barcode = barcode;
      if (weight !== undefined) product.weight = weight ? parseFloat(weight) : undefined;
      if (dimensions) product.dimensions = JSON.parse(dimensions);
      if (variants) product.variants = JSON.parse(variants);
      if (tags) product.tags = tags.split(',').map(tag => tag.trim());
      if (featured !== undefined) product.featured = featured === 'true';
      if (inventory) product.inventory = { ...product.inventory, ...JSON.parse(inventory) };
      if (seo) product.seo = { ...product.seo, ...JSON.parse(seo) };
      if (status) product.status = status;

      // Handle new images
      if (req.files && req.files.length > 0) {
        const newImages = req.files.map((file, index) => ({
          url: `/uploads/products/${file.filename}`,
          alt: `${product.name} - Image ${index + 1}`,
          isPrimary: product.images.length === 0 && index === 0
        }));
        product.images.push(...newImages);
      }

      product.updatedBy = req.user._id;
      await product.save();

      // Check for low stock and notify admins
      if (product.inventory.trackQuantity && 
          product.inventory.quantity <= product.inventory.lowStockThreshold) {
        notifications.lowStock(product);
      }

      await product.populate('category', 'name slug');

      res.json({
        message: 'Product updated successfully',
        product
      });
    } catch (error) {
      console.error('Update product error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  // Delete product (Admin only)
  deleteProduct: async (req, res) => {
    try {
      const product = await Product.findById(req.params.id);
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }

      // Instead of deleting, mark as archived
      product.status = 'archived';
      await product.save();

      res.json({ message: 'Product archived successfully' });
    } catch (error) {
      console.error('Delete product error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  // Get products by category
  getProductsByCategory: async (req, res) => {
    try {
      const { categorySlug } = req.params;
      const { page = 1, limit = 12, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

      // Find category
      const category = await Category.findOne({ slug: categorySlug, isActive: true });
      if (!category) {
        return res.status(404).json({ message: 'Category not found' });
      }

      // Get all descendant categories
      const descendants = await category.getDescendants();
      const categoryIds = [category._id, ...descendants.map(cat => cat._id)];

      // Build filter
      const filter = {
        category: { $in: categoryIds },
        status: 'active'
      };

      // Build sort
      const sort = {};
      sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

      // Execute query
      const skip = (parseInt(page) - 1) * parseInt(limit);
      
      const [products, total] = await Promise.all([
        Product.find(filter)
          .populate('category', 'name slug')
          .sort(sort)
          .skip(skip)
          .limit(parseInt(limit)),
        Product.countDocuments(filter)
      ]);

      res.json({
        category,
        products,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      });
    } catch (error) {
      console.error('Get products by category error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  // Get featured products
  getFeaturedProducts: async (req, res) => {
    try {
      const { limit = 8 } = req.query;

      const products = await Product.find({
        featured: true,
        status: 'active'
      })
        .populate('category', 'name slug')
        .sort({ createdAt: -1 })
        .limit(parseInt(limit));

      res.json({ products });
    } catch (error) {
      console.error('Get featured products error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  // Get new arrivals
  getNewArrivals: async (req, res) => {
    try {
      const { limit = 8 } = req.query;

      const products = await Product.find({
        status: 'active'
      })
        .populate('category', 'name slug')
        .sort({ createdAt: -1 })
        .limit(parseInt(limit));

      res.json({ products });
    } catch (error) {
      console.error('Get new arrivals error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  // Update product inventory (Admin only)
  updateInventory: async (req, res) => {
    try {
      const { quantity, lowStockThreshold } = req.body;
      
      const product = await Product.findById(req.params.id);
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }

      if (quantity !== undefined) {
        product.inventory.quantity = parseInt(quantity);
      }
      
      if (lowStockThreshold !== undefined) {
        product.inventory.lowStockThreshold = parseInt(lowStockThreshold);
      }

      await product.save();

      res.json({
        message: 'Inventory updated successfully',
        inventory: product.inventory
      });
    } catch (error) {
      console.error('Update inventory error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  // Search products
  searchProducts: async (req, res) => {
    try {
      const { q, page = 1, limit = 12 } = req.query;

      if (!q || q.trim().length < 2) {
        return res.status(400).json({ message: 'Search query too short' });
      }

      const searchQuery = q.trim();
      const filter = {
        status: 'active',
        $or: [
          { name: { $regex: searchQuery, $options: 'i' } },
          { description: { $regex: searchQuery, $options: 'i' } },
          { shortDescription: { $regex: searchQuery, $options: 'i' } },
          { tags: { $in: [new RegExp(searchQuery, 'i')] } },
          { sku: { $regex: searchQuery, $options: 'i' } },
          { barcode: { $regex: searchQuery, $options: 'i' } }
        ]
      };

      const skip = (parseInt(page) - 1) * parseInt(limit);
      
      const [products, total] = await Promise.all([
        Product.find(filter)
          .populate('category', 'name slug')
          .sort({ _id: -1 })
          .skip(skip)
          .limit(parseInt(limit)),
        Product.countDocuments(filter)
      ]);

      res.json({
        query: searchQuery,
        products,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      });
    } catch (error) {
      console.error('Search products error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
};

module.exports = productController;