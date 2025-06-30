const Ticket = require('../models/Ticket');
const User = require('../models/User');
const { validationResult } = require('express-validator');
const { notifications } = require('../utils/socket');
const { emailService } = require('../utils/email');

const ticketController = {
  // Create new ticket
  createTicket: async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          message: 'Validation failed', 
          errors: errors.array() 
        });
      }

      const {
        subject,
        category,
        message,
        priority = 'medium',
        customer,
        relatedOrder,
        relatedProduct,
        language = 'en'
      } = req.body;

      // Process attachments
      const attachments = [];
      if (req.files && req.files.length > 0) {
        req.files.forEach(file => {
          attachments.push({
            filename: file.filename,
            originalName: file.originalname,
            mimetype: file.mimetype,
            size: file.size,
            url: `/uploads/tickets/${file.filename}`
          });
        });
      }

      const ticket = new Ticket({
        subject,
        category,
        priority,
        customer: {
          user: req.user?._id || null,
          name: customer.name,
          email: customer.email,
          phone: customer.phone
        },
        relatedOrder,
        relatedProduct,
        language
      });

      // Add initial message
      ticket.addMessage(
        req.user?._id || null,
        'customer',
        message,
        attachments
      );

      await ticket.save();

      // Notify admins
      notifications.newTicket(ticket);

      res.status(201).json({
        message: 'Support ticket created successfully',
        ticket: {
          ticketNumber: ticket.ticketNumber,
          subject: ticket.subject,
          status: ticket.status
        }
      });
    } catch (error) {
      console.error('Create ticket error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  // Get tickets for user
  getUserTickets: async (req, res) => {
    try {
      const { page = 1, limit = 10, status } = req.query;
      const skip = (parseInt(page) - 1) * parseInt(limit);

      const filter = {};
      
      if (req.user) {
        filter['customer.user'] = req.user._id;
      } else {
        // For guest users, require email in request body
        if (!req.body.email) {
          return res.status(400).json({ message: 'Email is required for guest users' });
        }
        filter['customer.email'] = req.body.email.toLowerCase();
      }

      if (status) {
        filter.status = status;
      }

      const [tickets, total] = await Promise.all([
        Ticket.find(filter)
          .populate('relatedOrder', 'orderNumber')
          .populate('relatedProduct', 'name')
          .sort({ lastActivityAt: -1 })
          .skip(skip)
          .limit(parseInt(limit)),
        Ticket.countDocuments(filter)
      ]);

      res.json({
        tickets,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      });
    } catch (error) {
      console.error('Get user tickets error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  // Get ticket by number
  getTicketByNumber: async (req, res) => {
    try {
      const { ticketNumber } = req.params;

      const ticket = await Ticket.findOne({ ticketNumber })
        .populate('relatedOrder', 'orderNumber')
        .populate('relatedProduct', 'name')
        .populate('assignedTo', 'firstName lastName')
        .populate('messages.sender', 'firstName lastName role');

      if (!ticket) {
        return res.status(404).json({ message: 'Ticket not found' });
      }

      // Check if user can access this ticket
      if (req.user) {
        const canAccess = 
          req.user.role === 'admin' ||
          (ticket.customer.user && ticket.customer.user.toString() === req.user._id.toString()) ||
          (!ticket.customer.user && ticket.customer.email === req.user.email);

        if (!canAccess) {
          return res.status(403).json({ message: 'Access denied' });
        }
      } else {
        // For guest access, check email
        if (!req.query.email || ticket.customer.email !== req.query.email.toLowerCase()) {
          return res.status(403).json({ message: 'Access denied' });
        }
      }

      res.json({ ticket });
    } catch (error) {
      console.error('Get ticket error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  // Add message to ticket
  addMessage: async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          message: 'Validation failed', 
          errors: errors.array() 
        });
      }

      const { ticketId } = req.params;
      const { message, isInternal = false } = req.body;

      const ticket = await Ticket.findById(ticketId);
      if (!ticket) {
        return res.status(404).json({ message: 'Ticket not found' });
      }

      // Check access permissions
      const isAdmin = req.user?.role === 'admin';
      const isCustomer = ticket.customer.user && 
        ticket.customer.user.toString() === req.user?._id.toString();

      if (!isAdmin && !isCustomer) {
        return res.status(403).json({ message: 'Access denied' });
      }

      // Process attachments
      const attachments = [];
      if (req.files && req.files.length > 0) {
        req.files.forEach(file => {
          attachments.push({
            filename: file.filename,
            originalName: file.originalname,
            mimetype: file.mimetype,
            size: file.size,
            url: `/uploads/tickets/${file.filename}`
          });
        });
      }

      // Add message
      const senderType = isAdmin ? 'admin' : 'customer';
      ticket.addMessage(
        req.user._id,
        senderType,
        message,
        attachments,
        isInternal && isAdmin
      );

      await ticket.save();

      // Send notifications
      if (isAdmin) {
        // Notify customer
        notifications.ticketResponse(ticket, ticket.customer.user);
        
        // Send email if not internal message
        if (!isInternal) {
          try {
            await emailService.sendTicketResponse(ticket, message, ticket.language);
          } catch (emailError) {
            console.error('Error sending ticket response email:', emailError);
          }
        }
      } else {
        // Notify admins
        notifications.ticketResponse(ticket);
      }

      res.json({
        message: 'Message added successfully',
        ticket
      });
    } catch (error) {
      console.error('Add message error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  // Admin: Get all tickets
  getAllTickets: async (req, res) => {
    try {
      const {
        page = 1,
        limit = 20,
        status,
        priority,
        category,
        assignedTo,
        search
      } = req.query;

      // Build filter
      const filter = {};
      if (status) filter.status = status;
      if (priority) filter.priority = priority;
      if (category) filter.category = category;
      if (assignedTo) filter.assignedTo = assignedTo;

      if (search) {
        filter.$or = [
          { ticketNumber: { $regex: search, $options: 'i' } },
          { subject: { $regex: search, $options: 'i' } },
          { 'customer.name': { $regex: search, $options: 'i' } },
          { 'customer.email': { $regex: search, $options: 'i' } }
        ];
      }

      const skip = (parseInt(page) - 1) * parseInt(limit);

      const [tickets, total] = await Promise.all([
        Ticket.find(filter)
          .populate('customer.user', 'firstName lastName')
          .populate('assignedTo', 'firstName lastName')
          .populate('relatedOrder', 'orderNumber')
          .populate('relatedProduct', 'name')
          .sort({ lastActivityAt: -1 })
          .skip(skip)
          .limit(parseInt(limit)),
        Ticket.countDocuments(filter)
      ]);

      res.json({
        tickets,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      });
    } catch (error) {
      console.error('Get all tickets error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  // Admin: Update ticket
  updateTicket: async (req, res) => {
    try {
      const { ticketId } = req.params;
      const { status, priority, assignedTo, category } = req.body;

      const ticket = await Ticket.findById(ticketId);
      if (!ticket) {
        return res.status(404).json({ message: 'Ticket not found' });
      }

      // Update fields
      if (status) ticket.status = status;
      if (priority) ticket.priority = priority;
      if (assignedTo) ticket.assignedTo = assignedTo;
      if (category) ticket.category = category;

      await ticket.save();

      res.json({
        message: 'Ticket updated successfully',
        ticket
      });
    } catch (error) {
      console.error('Update ticket error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  // Admin: Close ticket
  closeTicket: async (req, res) => {
    try {
      const { ticketId } = req.params;
      const { summary } = req.body;

      const ticket = await Ticket.findById(ticketId);
      if (!ticket) {
        return res.status(404).json({ message: 'Ticket not found' });
      }

      ticket.closeTicket(summary, req.user._id);
      await ticket.save();

      res.json({
        message: 'Ticket closed successfully',
        ticket
      });
    } catch (error) {
      console.error('Close ticket error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  // Admin: Get ticket statistics
  getTicketStatistics: async (req, res) => {
    try {
      const { period = '30' } = req.query;
      const days = parseInt(period);
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const statistics = await Ticket.getStatistics({
        startDate,
        endDate: new Date()
      });

      // Get tickets by category
      const categoryStats = await Ticket.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate }
          }
        },
        {
          $group: {
            _id: '$category',
            count: { $sum: 1 }
          }
        }
      ]);

      // Get tickets by priority
      const priorityStats = await Ticket.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate }
          }
        },
        {
          $group: {
            _id: '$priority',
            count: { $sum: 1 }
          }
        }
      ]);

      res.json({
        statistics,
        categoryStats,
        priorityStats
      });
    } catch (error) {
      console.error('Get ticket statistics error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
};

module.exports = ticketController;