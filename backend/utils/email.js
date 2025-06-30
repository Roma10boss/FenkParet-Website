const nodemailer = require('nodemailer');

// Email configuration
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// Email templates
const emailTemplates = {
  orderConfirmation: {
    en: {
      subject: 'Order Confirmation - #{orderNumber}',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1f241f;">Order Confirmation</h2>
          <p>Dear #{customerName},</p>
          <p>Thank you for your order! We have received your payment confirmation and your order is now being processed.</p>
          
          <div style="background: #f5f5f5; padding: 20px; margin: 20px 0;">
            <h3>Order Details</h3>
            <p><strong>Order Number:</strong> #{orderNumber}</p>
            <p><strong>Order Date:</strong> #{orderDate}</p>
            <p><strong>Total Amount:</strong> #{total} HTG</p>
          </div>
          
          <div style="margin: 20px 0;">
            <h3>Items Ordered:</h3>
            #{itemsList}
          </div>
          
          <div style="margin: 20px 0;">
            <h3>Shipping Address:</h3>
            <p>#{shippingAddress}</p>
          </div>
          
          <p>You can track your order status using order number: <strong>#{orderNumber}</strong></p>
          
          <p>If you have any questions, please don't hesitate to contact us.</p>
          
          <p>Best regards,<br>Fenkparet Team</p>
        </div>
      `
    },
    fr: {
      subject: 'Confirmation de commande - #{orderNumber}',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1f241f;">Confirmation de commande</h2>
          <p>Cher/Chère #{customerName},</p>
          <p>Merci pour votre commande! Nous avons reçu la confirmation de votre paiement et votre commande est maintenant en cours de traitement.</p>
          
          <div style="background: #f5f5f5; padding: 20px; margin: 20px 0;">
            <h3>Détails de la commande</h3>
            <p><strong>Numéro de commande:</strong> #{orderNumber}</p>
            <p><strong>Date de commande:</strong> #{orderDate}</p>
            <p><strong>Montant total:</strong> #{total} HTG</p>
          </div>
          
          <div style="margin: 20px 0;">
            <h3>Articles commandés:</h3>
            #{itemsList}
          </div>
          
          <div style="margin: 20px 0;">
            <h3>Adresse de livraison:</h3>
            <p>#{shippingAddress}</p>
          </div>
          
          <p>Vous pouvez suivre le statut de votre commande avec le numéro: <strong>#{orderNumber}</strong></p>
          
          <p>Si vous avez des questions, n'hésitez pas à nous contacter.</p>
          
          <p>Cordialement,<br>L'équipe Fenkparet</p>
        </div>
      `
    }
  },
  
  orderStatusUpdate: {
    en: {
      subject: 'Order Status Update - #{orderNumber}',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1f241f;">Order Status Update</h2>
          <p>Dear #{customerName},</p>
          <p>Your order status has been updated:</p>
          
          <div style="background: #f5f5f5; padding: 20px; margin: 20px 0;">
            <p><strong>Order Number:</strong> #{orderNumber}</p>
            <p><strong>Status:</strong> #{status}</p>
            <p><strong>Updated:</strong> #{updateDate}</p>
            #{trackingInfo}
          </div>
          
          <p>#{statusMessage}</p>
          
          <p>Best regards,<br>Fenkparet Team</p>
        </div>
      `
    },
    fr: {
      subject: 'Mise à jour du statut - #{orderNumber}',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1f241f;">Mise à jour du statut</h2>
          <p>Cher/Chère #{customerName},</p>
          <p>Le statut de votre commande a été mis à jour:</p>
          
          <div style="background: #f5f5f5; padding: 20px; margin: 20px 0;">
            <p><strong>Numéro de commande:</strong> #{orderNumber}</p>
            <p><strong>Statut:</strong> #{status}</p>
            <p><strong>Mis à jour:</strong> #{updateDate}</p>
            #{trackingInfo}
          </div>
          
          <p>#{statusMessage}</p>
          
          <p>Cordialement,<br>L'équipe Fenkparet</p>
        </div>
      `
    }
  },
  
  ticketResponse: {
    en: {
      subject: 'Support Ticket Response - #{ticketNumber}',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1f241f;">Support Ticket Response</h2>
          <p>Dear #{customerName},</p>
          <p>We have responded to your support ticket:</p>
          
          <div style="background: #f5f5f5; padding: 20px; margin: 20px 0;">
            <p><strong>Ticket Number:</strong> #{ticketNumber}</p>
            <p><strong>Subject:</strong> #{subject}</p>
            <p><strong>Status:</strong> #{status}</p>
          </div>
          
          <div style="border-left: 4px solid #1f241f; padding-left: 20px; margin: 20px 0;">
            <h4>Latest Response:</h4>
            <p>#{responseMessage}</p>
          </div>
          
          <p>You can continue the conversation by replying to this ticket.</p>
          
          <p>Best regards,<br>Support Team</p>
        </div>
      `
    },
    fr: {
      subject: 'Réponse au ticket - #{ticketNumber}',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1f241f;">Réponse au ticket de support</h2>
          <p>Cher/Chère #{customerName},</p>
          <p>Nous avons répondu à votre ticket de support:</p>
          
          <div style="background: #f5f5f5; padding: 20px; margin: 20px 0;">
            <p><strong>Numéro de ticket:</strong> #{ticketNumber}</p>
            <p><strong>Sujet:</strong> #{subject}</p>
            <p><strong>Statut:</strong> #{status}</p>
          </div>
          
          <div style="border-left: 4px solid #1f241f; padding-left: 20px; margin: 20px 0;">
            <h4>Dernière réponse:</h4>
            <p>#{responseMessage}</p>
          </div>
          
          <p>Vous pouvez continuer la conversation en répondant à ce ticket.</p>
          
          <p>Cordialement,<br>Équipe de support</p>
        </div>
      `
    }
  },

  lowStockAlert: {
    en: {
      subject: 'Low Stock Alert - #{productName}',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #f59e0b;">⚠️ Low Stock Alert</h2>
          <p>The following product is running low on stock:</p>
          
          <div style="background: #fef3c7; padding: 20px; margin: 20px 0; border-left: 4px solid #f59e0b;">
            <h3>#{productName}</h3>
            <p><strong>SKU:</strong> #{sku}</p>
            <p><strong>Current Stock:</strong> #{currentStock} units</p>
            <p><strong>Low Stock Threshold:</strong> #{threshold} units</p>
            <p><strong>Category:</strong> #{category}</p>
          </div>
          
          <p>Please consider restocking this item to avoid stockouts.</p>
          
          <p>Admin Panel: <a href="#{adminUrl}/products/#{productId}">View Product</a></p>
        </div>
      `
    },
    fr: {
      subject: 'Alerte stock faible - #{productName}',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #f59e0b;">⚠️ Alerte Stock Faible</h2>
          <p>Le produit suivant a un stock faible:</p>
          
          <div style="background: #fef3c7; padding: 20px; margin: 20px 0; border-left: 4px solid #f59e0b;">
            <h3>#{productName}</h3>
            <p><strong>SKU:</strong> #{sku}</p>
            <p><strong>Stock actuel:</strong> #{currentStock} unités</p>
            <p><strong>Seuil d'alerte:</strong> #{threshold} unités</p>
            <p><strong>Catégorie:</strong> #{category}</p>
          </div>
          
          <p>Veuillez considérer réapprovisionner cet article pour éviter les ruptures.</p>
          
          <p>Panneau d'admin: <a href="#{adminUrl}/products/#{productId}">Voir le produit</a></p>
        </div>
      `
    }
  },

  reviewSubmitted: {
    en: {
      subject: 'Thank you for your review!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1f241f;">Thank you for your review!</h2>
          <p>Dear #{customerName},</p>
          <p>Thank you for taking the time to review #{productName}. Your feedback helps other customers make informed decisions.</p>
          
          <div style="background: #f5f5f5; padding: 20px; margin: 20px 0;">
            <h3>Your Review</h3>
            <p><strong>Product:</strong> #{productName}</p>
            <p><strong>Rating:</strong> #{rating}/5 stars</p>
            <p><strong>Title:</strong> #{reviewTitle}</p>
          </div>
          
          <p>Your review is currently being reviewed by our team and will be published shortly.</p>
          
          <p>Best regards,<br>Fenkparet Team</p>
        </div>
      `
    },
    fr: {
      subject: 'Merci pour votre avis!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1f241f;">Merci pour votre avis!</h2>
          <p>Cher/Chère #{customerName},</p>
          <p>Merci d'avoir pris le temps d'évaluer #{productName}. Vos commentaires aident d'autres clients à prendre des décisions éclairées.</p>
          
          <div style="background: #f5f5f5; padding: 20px; margin: 20px 0;">
            <h3>Votre avis</h3>
            <p><strong>Produit:</strong> #{productName}</p>
            <p><strong>Note:</strong> #{rating}/5 étoiles</p>
            <p><strong>Titre:</strong> #{reviewTitle}</p>
          </div>
          
          <p>Votre avis est en cours de révision par notre équipe et sera publié sous peu.</p>
          
          <p>Cordialement,<br>L'équipe Fenkparet</p>
        </div>
      `
    }
  },

  welcomeEmail: {
    en: {
      subject: 'Welcome to Fenkparet!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1f241f;">Welcome to Fenkparet!</h2>
          <p>Dear #{customerName},</p>
          <p>Welcome to Fenkparet! We're excited to have you as part of our community.</p>
          
          <div style="background: #f5f5f5; padding: 20px; margin: 20px 0;">
            <h3>Get Started</h3>
            <ul>
              <li>Browse our quality Haitian products</li>
              <li>Enjoy secure MonCash payments</li>
              <li>Track your orders easily</li>
              <li>Get support when you need it</li>
            </ul>
          </div>
          
          <p>Start shopping now: <a href="#{siteUrl}/products">Browse Products</a></p>
          
          <p>If you have any questions, don't hesitate to contact us.</p>
          
          <p>Best regards,<br>Fenkparet Team</p>
        </div>
      `
    },
    fr: {
      subject: 'Bienvenue chez Fenkparet!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1f241f;">Bienvenue chez Fenkparet!</h2>
          <p>Cher/Chère #{customerName},</p>
          <p>Bienvenue chez Fenkparet! Nous sommes ravis de vous compter parmi notre communauté.</p>
          
          <div style="background: #f5f5f5; padding: 20px; margin: 20px 0;">
            <h3>Commencer</h3>
            <ul>
              <li>Parcourir nos produits haïtiens de qualité</li>
              <li>Profiter des paiements MonCash sécurisés</li>
              <li>Suivre vos commandes facilement</li>
              <li>Obtenir de l'aide quand vous en avez besoin</li>
            </ul>
          </div>
          
          <p>Commencez vos achats maintenant: <a href="#{siteUrl}/products">Parcourir les produits</a></p>
          
          <p>Si vous avez des questions, n'hésitez pas à nous contacter.</p>
          
          <p>Cordialement,<br>L'équipe Fenkparet</p>
        </div>
      `
    }
  }
};

// Template replacement function
const replaceTemplateVariables = (template, variables) => {
  let result = template;
  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`#{${key}}`, 'g');
    result = result.replace(regex, value || '');
  }
  return result;
};

// Email sending functions
const emailService = {
  // Send order confirmation email
  sendOrderConfirmation: async (orderData, language = 'en') => {
    try {
      const template = emailTemplates.orderConfirmation[language];
      
      // Prepare items list
      const itemsList = orderData.items.map(item => 
        `<div style="padding: 10px; border-bottom: 1px solid #ddd;">
          <p><strong>${item.productSnapshot.name}</strong> ${item.variant ? `(${item.variant.name}: ${item.variant.value})` : ''}</p>
          <p>Quantity: ${item.quantity} × ${item.unitPrice} HTG = ${item.totalPrice} HTG</p>
        </div>`
      ).join('');
      
      // Prepare shipping address
      const shippingAddress = `
        ${orderData.shippingAddress.street}<br>
        ${orderData.shippingAddress.city}, ${orderData.shippingAddress.state || ''} ${orderData.shippingAddress.postalCode || ''}<br>
        ${orderData.shippingAddress.country}
      `;
      
      const variables = {
        customerName: orderData.customer.firstName + ' ' + orderData.customer.lastName,
        orderNumber: orderData.orderNumber,
        orderDate: new Date(orderData.createdAt).toLocaleDateString(),
        total: orderData.pricing.total,
        itemsList,
        shippingAddress
      };
      
      const subject = replaceTemplateVariables(template.subject, variables);
      const html = replaceTemplateVariables(template.html, variables);
      
      await transporter.sendMail({
        from: process.env.SMTP_FROM || 'noreply@fenkparet.com',
        to: orderData.customer.email,
        subject,
        html
      });
      
      console.log('Order confirmation email sent to:', orderData.customer.email);
    } catch (error) {
      console.error('Error sending order confirmation email:', error);
      throw error;
    }
  },
  
  // Send order status update email
  sendOrderStatusUpdate: async (orderData, language = 'en') => {
    try {
      const template = emailTemplates.orderStatusUpdate[language];
      
      // Status messages
      const statusMessages = {
        en: {
          confirmed: 'Your order has been confirmed and is being prepared.',
          processing: 'Your order is currently being processed.',
          shipped: 'Your order has been shipped and is on its way to you.',
          delivered: 'Your order has been delivered.',
          cancelled: 'Your order has been cancelled.'
        },
        fr: {
          confirmed: 'Votre commande a été confirmée et est en cours de préparation.',
          processing: 'Votre commande est en cours de traitement.',
          shipped: 'Votre commande a été expédiée et est en route vers vous.',
          delivered: 'Votre commande a été livrée.',
          cancelled: 'Votre commande a été annulée.'
        }
      };
      
      // Tracking info
      let trackingInfo = '';
      if (orderData.tracking && orderData.tracking.number) {
        trackingInfo = language === 'fr' 
          ? `<p><strong>Numéro de suivi:</strong> ${orderData.tracking.number}</p>`
          : `<p><strong>Tracking Number:</strong> ${orderData.tracking.number}</p>`;
      }
      
      const variables = {
        customerName: orderData.customer.firstName + ' ' + orderData.customer.lastName,
        orderNumber: orderData.orderNumber,
        status: orderData.status,
        updateDate: new Date().toLocaleDateString(),
        trackingInfo,
        statusMessage: statusMessages[language][orderData.status] || ''
      };
      
      const subject = replaceTemplateVariables(template.subject, variables);
      const html = replaceTemplateVariables(template.html, variables);
      
      await transporter.sendMail({
        from: process.env.SMTP_FROM || 'noreply@fenkparet.com',
        to: orderData.customer.email,
        subject,
        html
      });
      
      console.log('Order status update email sent to:', orderData.customer.email);
    } catch (error) {
      console.error('Error sending order status update email:', error);
      throw error;
    }
  },
  
  // Send ticket response email
  sendTicketResponse: async (ticketData, responseMessage, language = 'en') => {
    try {
      const template = emailTemplates.ticketResponse[language];
      
      const variables = {
        customerName: ticketData.customer.name,
        ticketNumber: ticketData.ticketNumber,
        subject: ticketData.subject,
        status: ticketData.status,
        responseMessage
      };
      
      const subject = replaceTemplateVariables(template.subject, variables);
      const html = replaceTemplateVariables(template.html, variables);
      
      await transporter.sendMail({
        from: process.env.SMTP_FROM || 'noreply@fenkparet.com',
        to: ticketData.customer.email,
        subject,
        html
      });
      
      console.log('Ticket response email sent to:', ticketData.customer.email);
    } catch (error) {
      console.error('Error sending ticket response email:', error);
      throw error;
    }
  },
  
  // Send contact form email
  sendContactForm: async (contactData) => {
    try {
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>New Contact Form Submission</h2>
          <div style="background: #f5f5f5; padding: 20px; margin: 20px 0;">
            <p><strong>Name:</strong> ${contactData.name}</p>
            <p><strong>Email:</strong> ${contactData.email}</p>
            <p><strong>Phone:</strong> ${contactData.phone || 'Not provided'}</p>
            <p><strong>Subject:</strong> ${contactData.subject || 'General Inquiry'}</p>
          </div>
          <div style="margin: 20px 0;">
            <h3>Message:</h3>
            <p>${contactData.message}</p>
          </div>
          <p><small>Received: ${new Date().toLocaleString()}</small></p>
        </div>
      `;
      
      await transporter.sendMail({
        from: process.env.SMTP_FROM || 'noreply@fenkparet.com',
        to: process.env.CONTACT_EMAIL || process.env.SMTP_USER,
        subject: `Contact Form: ${contactData.subject || 'New Message'}`,
        html,
        replyTo: contactData.email
      });
      
      console.log('Contact form email sent');
    } catch (error) {
      console.error('Error sending contact form email:', error);
      throw error;
    }
  }
};

// Test email connection
const testEmailConnection = async () => {
  try {
    await transporter.verify();
    console.log('Email service is ready');
    return true;
  } catch (error) {
    console.error('Email service error:', error);
    return false;
  }
};

module.exports = {
  emailService,
  testEmailConnection
};