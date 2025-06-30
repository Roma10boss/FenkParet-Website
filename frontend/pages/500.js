// pages/500.js
import React from 'react';
import Head from 'next/head';
import Link from 'next/link';

export default function Custom500() {

  return (
    <>
      <Head>
        <title>Server Error - Fenkparet</title>
        <meta name="description" content="Internal server error occurred." />
      </Head>
      
      <div className="min-h-screen flex items-center justify-center bg-theme-primary px-4">
        <div className="max-w-lg w-full text-center">
          <div className="mb-8">
            <h1 className="text-9xl font-bold text-error-color mb-4">500</h1>
            <h2 className="text-3xl font-bold text-theme-primary mb-4">
              Server Error
            </h2>
            <p className="text-lg text-theme-secondary mb-8">
              Something went wrong on our end. We&apos;re working to fix this issue. Please try again later.
            </p>
          </div>
          
          <div className="space-y-4">
            <button
              onClick={() => window.location.reload()}
              className="inline-block bg-accent text-accent-contrast px-8 py-3 rounded-lg font-semibold hover:bg-accent-dark transition-colors mr-4"
            >
              Try Again
            </button>
            
            <Link
              href="/"
              className="inline-block bg-theme-secondary text-theme-primary px-8 py-3 rounded-lg font-semibold hover:bg-theme-tertiary transition-colors border border-theme"
            >
              Go to Homepage
            </Link>
            
            <div className="flex justify-center space-x-4 mt-6">
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
                {'navigation.about' || 'About'}
              </Link>
            </div>
          </div>
          
          <div className="mt-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-theme-secondary rounded-full mb-4">
              <svg 
                className="w-10 h-10 text-error-color" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <p className="text-sm text-theme-tertiary">
              If this problem persists, please{' '}
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