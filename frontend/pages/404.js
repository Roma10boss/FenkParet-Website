// pages/404.js
import React from 'react';
import Head from 'next/head';
import Link from 'next/link';

export default function Custom404() {

  return (
    <>
      <Head>
        <title>Page Not Found - Fenkparet</title>
        <meta name="description" content="The page you are looking for could not be found." />
      </Head>
      
      <div className="min-h-screen flex items-center justify-center bg-theme-primary px-4">
        <div className="max-w-lg w-full text-center">
          <div className="mb-8">
            <h1 className="text-9xl font-bold text-accent mb-4">404</h1>
            <h2 className="text-3xl font-bold text-theme-primary mb-4">
              Page Not Found
            </h2>
            <p className="text-lg text-theme-secondary mb-8">
              The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
            </p>
          </div>
          
          <div className="space-y-4">
            <Link
              href="/"
              className="inline-block bg-accent text-accent-contrast px-8 py-3 rounded-lg font-semibold hover:bg-accent-dark transition-colors"
            >
              Go to Homepage
            </Link>
            
            <div className="flex justify-center space-x-4">
              <Link
                href="/products"
                className="text-theme-secondary hover:text-accent transition-colors"
              >
                Products
              </Link>
              <span className="text-theme-tertiary">•</span>
              <Link
                href="/contact"
                className="text-theme-secondary hover:text-accent transition-colors"
              >
                Contact
              </Link>
              <span className="text-theme-tertiary">•</span>
              <Link
                href="/about"
                className="text-theme-secondary hover:text-accent transition-colors"
              >
                About
              </Link>
            </div>
          </div>
          
          <div className="mt-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-theme-secondary rounded-full mb-4">
              <svg 
                className="w-10 h-10 text-accent" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-3-3v3m0 0v3m0-3h3m-3 0H9"
                />
              </svg>
            </div>
            <p className="text-sm text-theme-tertiary">
              If you think this is a mistake, please{' '}
              <Link href="/contact" className="text-accent hover:underline">
                contact our support team
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}