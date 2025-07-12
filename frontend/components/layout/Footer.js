// components/layout/Footer.js
import React, { useState } from 'react';
import Link from 'next/link'; // Keep Link for navigation if needed
import {
  PhoneIcon,
  EnvelopeIcon,
  HeartIcon // Keeping HeartIcon for 'made with love' sentiment
} from '@heroicons/react/24/outline'; // Named imports for icons
import { toast } from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';

const Footer = () => { // Define as a regular const
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { isAuthenticated } = useAuth();
  const currentYear = new Date().getFullYear();

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    
    if (!newsletterEmail.trim()) {
      toast.error('Veuillez entrer votre adresse email.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newsletterEmail)) {
      toast.error('Veuillez entrer une adresse email valide.');
      return;
    }

    setIsSubmitting(true);
    try {
      // Store newsletter subscription locally for now
      const existingSubscriptions = JSON.parse(localStorage.getItem('newsletterSubscriptions') || '[]');
      
      // Check if email already exists
      if (existingSubscriptions.some(sub => sub.email === newsletterEmail)) {
        toast.error('Cette adresse email est déjà abonnée à notre newsletter.');
        setIsSubmitting(false);
        return;
      }

      const subscription = {
        email: newsletterEmail,
        subscribedAt: new Date().toISOString(),
        preferences: {
          newInventory: true,
          promotions: true,
          blogUpdates: true
        },
        status: 'active'
      };

      existingSubscriptions.push(subscription);
      localStorage.setItem('newsletterSubscriptions', JSON.stringify(existingSubscriptions));

      // Try to send to backend if available
      try {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://fenkparet-backend.onrender.com'}/api/newsletter/subscribe`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(subscription),
        });
      } catch (serverError) {
        console.log('Server not available, subscription stored locally');
      }

      toast.success('Merci de vous être abonné! Vous recevrez des notifications pour les nouveaux arrivages.');
      setNewsletterEmail('');
    } catch (error) {
      console.error('Newsletter subscription error:', error);
      toast.error('Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <footer className="bg-theme-secondary text-theme-secondary py-8 md:py-10 border-t border-theme mt-auto theme-transition">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-6">

          {/* Brand Name & Quick Contact */}
          <div className="flex flex-col items-center md:items-start text-center md:text-left space-y-3">
            <Link
              href="/"
              className="text-2xl font-bold text-theme-primary hover:text-accent transition-colors"
              aria-label="Fenkparet Home"
            >
              Fenkparet
            </Link>
            <div className="space-y-1 text-sm text-theme-tertiary">
              {isAuthenticated ? (
                <>
                  <div className="flex items-center justify-center md:justify-start space-x-2">
                    <PhoneIcon className="w-4 h-4 text-accent" />
                    <a href="tel:+50947458821" className="hover:text-accent transition-colors">
                      (+509) 4745-8821
                    </a>
                  </div>
                  <div className="flex items-center justify-center md:justify-start space-x-2">
                    <EnvelopeIcon className="w-4 h-4 text-accent" />
                    <a href="mailto:fenkparet509@gmail.com" className="hover:text-accent transition-colors">
                      fenkparet509@gmail.com
                    </a>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center justify-center md:justify-start space-x-2">
                    <PhoneIcon className="w-4 h-4 text-accent" />
                    <span>(+509) 4745-8821</span>
                  </div>
                  <div className="flex items-center justify-center md:justify-start space-x-2">
                    <EnvelopeIcon className="w-4 h-4 text-accent" />
                    <span>fenkparet509@gmail.com</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Newsletter Signup */}
          <div className="w-full md:w-auto flex flex-col items-center md:items-end text-center md:text-right space-y-3">
            <h3 className="text-xl font-semibold text-theme-primary">
              Newsletter
            </h3>
            <p className="text-sm text-theme-tertiary max-w-sm">
              Restez informé de nos derniers produits et offres.
            </p>
            <form onSubmit={handleNewsletterSubmit} className="flex w-full max-w-sm">
              <input
                type="email"
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                placeholder="Votre email"
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 rounded-l-md border border-theme-border bg-theme-input text-theme-primary placeholder-theme-tertiary focus:outline-none focus:ring-2 focus:ring-accent disabled:opacity-50"
                aria-label="Votre email"
                required
              />
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 bg-accent text-accent-contrast rounded-r-md hover:bg-accent-hover transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'En cours...' : "S'abonner"}
              </button>
            </form>
          </div>
        </div>

        {/* Copyright & Built by */}
        <div className="border-t border-theme pt-6 mt-6 text-center text-sm text-theme-tertiary">
          <p className="mb-2">
            &copy; {currentYear} Fenkparet. Tous droits réservés.
          </p>
          <p>
            Built by{' '}
            <a
              href="https://github.com/Roma10boss"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:text-accent-hover font-medium transition-colors underline decoration-accent/30 hover:decoration-accent"
            >
              Romario Gustave
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer; // <-- Ensure this is the ONLY export for Footer
