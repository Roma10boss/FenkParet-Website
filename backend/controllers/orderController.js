const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const { validationResult } = require('express-validator');
const { notifications } = require('../utils/socket');
const { emailService } = require('../utils/email');

const orderController = {
  // Create new order
  createOrder: async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          message: 'Validation failed', 
          errors: errors.array() 
        });
      }

      const {
        items,
        customer,
        shippingAddress,
        billingAddress,
        payment,
        language = 'en'
      } = req.body;

      // Validate and process items
      const processedItems = [];
      let subtotal = 0;

      for (const item of items) {
        const product = await Product.findById(item.product);
        if (!product || product.status !== 'active') {
          return res.status(400).json({ 
            message: `Product ${item.product} is not available` 
          });
        }

        // Check inventory
        if (product.inventory.trackQuantity) {
          const availableQuantity = item.variant 
            ? product.variants.find(v => v.value === item.variant.value)?.quantity || 0
            : product.inventory.quantity;

          if (item.quantity > availableQuantity) {
            return res.status(400).json({ 
              message: `Not enough stock for ${product.name}` 
            });
          }
        }

        // Calculate price
        const unitPrice = item.variant 
          ? product.price + (item.variant.priceAdjustment || 0)
          : product.price;

        const totalPrice = unitPrice * item.quantity;
        subtotal += totalPrice;

        processedItems.push({
          product: product._id,
          productSnapshot: {
            name: product.name,
            price: product.price,
            image: product.primaryImage?.url || product.images[0]?.url,
            sku: product.sku
          },
          variant: item.variant,
          quantity: item.quantity,
          unitPrice,
          totalPrice
        });

        // Reduce inventory
        if (product.inventory.trackQuantity) {
          if (item.variant) {
            const variantIndex = product.variants.findIndex(v => v.value === item.variant.value);
            if (variantIndex !== -1) {
              product.variants[variantIndex].quantity -= item.quantity;
            }
          } else {
            product.reduceInventory(item.quantity);
          }
          await product.save();
        }
      }

      // Calculate totals
      const shipping = subtotal > 1000 ? 0 : 50; // Free shipping over 1000 HTG
      const tax = subtotal * 0.1; // 10% tax
      const total = subtotal + shipping + tax;

      // Create order
      const order = new Order({
        user: req.user?._id || null,
        customer,
        shippingAddress,
        billingAddress: billingAddress?.sameAsShipping !== false ? shippingAddress : billingAddress,
        items: processedItems,
        pricing: {
          subtotal: Math.round(subtotal * 100) / 100,
          shipping: Math.round(shipping * 100) / 100,
          tax: Math.round(tax * 100) / 100,
          total: Math.round(total * 100) / 100
        },
        payment: {
          method: 'moncash',
          moncash: {
            confirmationNumber: payment.moncash.confirmationNumber,
            customerName: payment.moncash.customerName,
            amount: Math.round(total * 100) / 100
          }
        },
        language
      });

      await order.save();

      // Notify admins of new order
      notifications.newOrder(order);
      notifications.paymentConfirmationRequest(order); // For MonCash orders

      res.status(201).json({
        message: 'Order created successfully',
        order: {
          orderNumber: order.orderNumber,
          total: order.pricing.total,
          status: order.status,
          expiresAt: order.expiresAt
        }
      });
    } catch (error) {
      console.error('Create order error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  // Get orders for user
  getUserOrders: async (req, res) => {
    try {
      const { page = 1, limit = 10 } = req.query;
      const skip = (parseInt(page) - 1) * parseInt(limit);

      const filter = req.user ? 
        { user: req.user._id } : 
        { 'customer.email': req.body.email }; // For guest orders

      const [orders, total] = await Promise.all([
        Order.find(filter)
          .populate('items.product', 'name images')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(parseInt(limit)),
        Order.countDocuments(filter)
      ]);

      res.json({
        orders,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      });
    } catch (error) {
      console.error('Get user orders error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  // Get order by number (for tracking)
  getOrderByNumber: async (req, res) => {
    try {
      const { orderNumber } = req.params;

      const order = await Order.findOne({ orderNumber })
        .populate('items.product', 'name images')
        .populate('user', 'firstName lastName email');

      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }

      // Check if user can access this order
      if (req.user) {
        if (order.user && order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
          return res.status(403).json({ message: 'Access denied' });
        }
      }

      res.json({ order });
    } catch (error) {
      console.error('Get order error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  // Track order by number (public endpoint)
  trackOrder: async (req, res) => {
    try {
      const { orderNumber } = req.params;
      const { email } = req.query;

      const filter = { orderNumber };
      if (email) {
        filter['customer.email'] = email.toLowerCase();
      }

      const order = await Order.findOne(filter)
        .select('orderNumber status timeline pricing createdAt tracking expiresAt')
        .populate('items.product', 'name');

      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }

      res.json({
        orderNumber: order.orderNumber,
        status: order.status,
        timeline: order.timeline,
        tracking: order.tracking,
        total: order.pricing.total,
        createdAt: order.createdAt,
        expiresAt: order.expiresAt,
        timeUntilExpiration: order.timeUntilExpiration
      });
    } catch (error) {
      console.error('Track order error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  // Admin: Get all orders
  getAllOrders: async (req, res) => {
    try {
      const {
        page = 1,
        limit = 20,
        status,
        paymentStatus,
        dateFrom,
        dateTo,
        search
      } = req.query;

      // Build filter
      const filter = {};
      if (status) filter.status = status;
      if (paymentStatus) filter['payment.status'] = paymentStatus;
      
      if (dateFrom || dateTo) {
        filter.createdAt = {};
        if (dateFrom) filter.createdAt.$gte = new Date(dateFrom);
        if (dateTo) filter.createdAt.$lte = new Date(dateTo);
      }

      if (search) {
        filter.$or = [
          { orderNumber: { $regex: search, $options: 'i' } },
          { 'customer.firstName': { $regex: search, $options: 'i' } },
          { 'customer.lastName': { $regex: search, $options: 'i' } },
          { 'customer.email': { $regex: search, $options: 'i' } }
        ];
      }

      const skip = (parseInt(page) - 1) * parseInt(limit);

      const [orders, total] = await Promise.all([
        Order.find(filter)
          .populate('user', 'firstName lastName email')
          .populate('items.product', 'name')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(parseInt(limit)),
        Order.countDocuments(filter)
      ]);

      res.json({
        orders,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      });
    } catch (error) {
      console.error('Get all orders error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  // Admin: Confirm payment
  confirmPayment: async (req, res) => {
    try {
      const { orderId } = req.params;
      const { notes } = req.body;

      const order = await Order.findById(orderId);
      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }

      if (order.payment.status === 'confirmed') {
        return res.status(400).json({ message: 'Payment already confirmed' });
      }

      // Confirm payment
      order.confirmPayment(req.user._id, notes);
      await order.save();

      // Send confirmation email
      try {
        await emailService.sendOrderConfirmation(order, order.language);
      } catch (emailError) {
        console.error('Error sending confirmation email:', emailError);
      }

      // Notify customer
      notifications.paymentConfirmed(order);
      notifications.orderStatusUpdate(order);

      res.json({
        message: 'Payment confirmed successfully',
        order
      });
    } catch (error) {
      console.error('Confirm payment error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  // Admin: Update order status
  updateOrderStatus: async (req, res) => {
    try {
      const { orderId } = req.params;
      const { status, message, trackingNumber, carrier } = req.body;

      const order = await Order.findById(orderId);
      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }

      // Update status
      order.addTimelineEntry(status, message, req.user._id);

      // Update tracking if provided
      if (trackingNumber) {
        order.tracking.number = trackingNumber;
        order.tracking.carrier = carrier;
      }

      await order.save();

      // Send status update email
      try {
        await emailService.sendOrderStatusUpdate(order, order.language);
      } catch (emailError) {
        console.error('Error sending status update email:', emailError);
      }

      // Notify customer
      notifications.orderStatusUpdate(order);

      res.json({
        message: 'Order status updated successfully',
        order
      });
    } catch (error) {
      console.error('Update order status error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  // Admin: Cancel order
  cancelOrder: async (req, res) => {
    try {
      const { orderId } = req.params;
      const { reason } = req.body;

      const order = await Order.findById(orderId);
      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }

      if (order.status === 'cancelled') {
        return res.status(400).json({ message: 'Order already cancelled' });
      }

      // Cancel order
      order.cancelOrder(reason, req.user._id);

      // Restore inventory
      for (const item of order.items) {
        const product = await Product.findById(item.product);
        if (product && product.inventory.trackQuantity) {
          if (item.variant) {
            const variantIndex = product.variants.findIndex(v => v.value === item.variant.value);
            if (variantIndex !== -1) {
              product.variants[variantIndex].quantity += item.quantity;
            }
          } else {
            product.inventory.quantity += item.quantity;
          }
          await product.save();
        }
      }

      await order.save();

      // Notify customer
      notifications.orderCancelled(order);

      res.json({
        message: 'Order cancelled successfully',
        order
      });
    } catch (error) {
      console.error('Cancel order error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  // Get order analytics
  getOrderAnalytics: async (req, res) => {
    try {
      const { period = '30' } = req.query; // days
      const days = parseInt(period);
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const analytics = await Order.getSalesAnalytics({
        startDate,
        endDate: new Date()
      });

      // Get daily sales for chart
      const dailySales = await Order.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate },
            status: { $in: ['confirmed', 'processing', 'shipped', 'delivered'] }
          }
        },
        {
          $group: {
            _id: {
              $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
            },
            revenue: { $sum: '$pricing.total' },
            orders: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]);

      // Get top products
      const topProducts = await Order.aggregate([
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
        { $sort: { totalSold: -1 } },
        { $limit: 10 }
      ]);

      res.json({
        analytics,
        dailySales,
        topProducts
      });
    } catch (error) {
      console.error('Get order analytics error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },
  // Place order with confirmation number
  placeOrderWithConfirmation: async (req, res) => {
    try {
      const { cart, confirmationNumber } = req.body;

      if (!cart || cart.length === 0) {
        return res.status(400).json({ message: 'Cart cannot be empty.' });
      }
      if (!confirmationNumber || confirmationNumber.trim() === '') {
        return res.status(400).json({ message: 'Confirmation number is required.' });
      }

      // Validate and process items from the cart
      const processedItems = [];
      let subtotal = 0;

      for (const item of cart) {
        const product = await Product.findById(item.productId);
        if (!product || product.status !== 'active') {
          return res.status(400).json({ message: `Product ${item.name} is not available` });
        }

        // Check inventory
        if (product.inventory.trackQuantity) {
          const availableQuantity = item.variant
            ? product.variants.find(v => v.value === item.variant.value)?.quantity || 0
            : product.inventory.quantity;

          if (item.quantity > availableQuantity) {
            return res.status(400).json({ message: `Not enough stock for ${product.name}` });
          }
        }

        // Calculate price
        const unitPrice = item.variant
          ? product.price + (item.variant.priceAdjustment || 0)
          : product.price;

        const totalPrice = unitPrice * item.quantity;
        subtotal += totalPrice;

        processedItems.push({
          product: product._id,
          productSnapshot: {
            name: product.name,
            price: product.price,
            image: product.primaryImage?.url || product.images[0]?.url,
            sku: product.sku
          },
          variant: item.variant,
          quantity: item.quantity,
          unitPrice,
          totalPrice
        });

        // Reduce inventory
        if (product.inventory.trackQuantity) {
          if (item.variant) {
            const variantIndex = product.variants.findIndex(v => v.value === item.variant.value);
            if (variantIndex !== -1) {
              product.variants[variantIndex].quantity -= item.quantity;
            }
          } else {
            product.reduceInventory(item.quantity);
          }
          await product.save();
        }
      }

      // Calculate totals (using simplified logic for now, can be expanded)
      const shipping = subtotal > 1000 ? 0 : 50; // Free shipping over 1000 HTG
      const tax = subtotal * 0.1; // 10% tax
      const total = subtotal + shipping + tax;

      // Create order
      const order = new Order({
        user: req.user?._id || null, // Associate with user if logged in
        customer: req.user ? {
          firstName: req.user.firstName,
          lastName: req.user.lastName,
          email: req.user.email,
          phone: req.user.phone || ''
        } : { // Placeholder for guest customer info, ideally collected from frontend
          firstName: 'Guest',
          lastName: 'User',
          email: 'guest@example.com', // This should be replaced with actual guest email
        },
        shippingAddress: req.user?.shippingAddress || { // Placeholder for shipping address
          street: 'N/A',
          city: 'N/A',
          state: 'N/A',
          zip: 'N/A',
          country: 'N/A'
        },
        billingAddress: req.user?.billingAddress || { // Placeholder for billing address
          street: 'N/A',
          city: 'N/A',
          state: 'N/A',
          zip: 'N/A',
          country: 'N/A'
        },
        items: processedItems,
        pricing: {
          subtotal: Math.round(subtotal * 100) / 100,
          shipping: Math.round(shipping * 100) / 100,
          tax: Math.round(tax * 100) / 100,
          total: Math.round(total * 100) / 100
        },
        payment: {
          method: 'confirmation_number',
          status: 'pending-confirmation', // New status for this payment method
          confirmationNumber: confirmationNumber,
          amount: Math.round(total * 100) / 100
        },
        status: 'pending', // Initial order status
        language: req.body.language || 'en'
      });

      await order.save();

      // Notify admins of new order awaiting confirmation
      notifications.newOrder(order);
      notifications.paymentConfirmationRequest(order); // For confirmation number orders

      res.status(201).json({
        message: 'Order placed successfully! Awaiting confirmation.',
        order: {
          orderNumber: order.orderNumber,
          total: order.pricing.total,
          status: order.status,
        }
      });

    } catch (error) {
      console.error('Place order with confirmation error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },
};

module.exports = orderController;