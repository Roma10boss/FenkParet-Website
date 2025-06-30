// components/layout/Footer.js
import React from 'react';
import Link from 'next/link'; // Keep Link for navigation if needed
import {
  PhoneIcon,
  EnvelopeIcon,
  HeartIcon // Keeping HeartIcon for 'made with love' sentiment
} from '@heroicons/react/24/outline'; // Named imports for icons

const Footer = () => { // Define as a regular const

  const currentYear = new Date().getFullYear();

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
              <div className="flex items-center justify-center md:justify-start space-x-2">
                <PhoneIcon className="w-4 h-4 text-accent" />
                <span>Appelez ou Textez Nous</span>
              </div>
              <div className="flex items-center justify-center md:justify-start space-x-2">
                <EnvelopeIcon className="w-4 h-4 text-accent" />
                <span>Envoyez-nous un Email</span>
              </div>
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
            <form className="flex w-full max-w-sm">
              <input
                type="email"
                placeholder="Votre email"
                className="flex-1 px-4 py-2 rounded-l-md border border-theme-border bg-theme-input text-theme-primary placeholder-theme-tertiary focus:outline-none focus:ring-2 focus:ring-accent"
                aria-label="Votre email"
              />
              <button
                type="submit"
                className="px-5 py-2 bg-accent text-accent-contrast rounded-r-md hover:bg-accent-hover transition-colors font-medium text-sm"
              >
                S&apos;abonner
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
