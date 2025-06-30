// pages/_error.js
import React from 'react';
import Head from 'next/head';
import Link from 'next/link';

function Error({ statusCode, hasGetInitialPropsRun, err }) {

  return (
    <>
      <Head>
        <title>
          {statusCode
            ? `${statusCode} - Server Error`
            : 'Client Error'}
        </title>
      </Head>
      <div className="min-h-screen flex items-center justify-center bg-theme-primary">
        <div className="max-w-md w-full bg-theme-secondary rounded-lg shadow-lg p-8 text-center">
          <div className="mb-4">
            <h1 className="text-6xl font-bold text-theme-primary mb-2">
              {statusCode || '400'}
            </h1>
            <h2 className="text-xl font-semibold text-theme-secondary mb-4">
              {statusCode
                ? statusCode === 404
                  ? 'Page Not Found'
                  : 'Server Error'
                : 'Client Error'}
            </h2>
          </div>
          
          <p className="text-theme-tertiary mb-6">
            {statusCode === 404
              ? 'The page you are looking for could not be found.'
              : 'Something went wrong. Please try again later.'}
          </p>
          
          <div className="space-y-3">
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-accent text-accent-contrast py-2 px-4 rounded-lg hover:bg-accent-dark transition-colors"
            >
              Try Again
            </button>
            
            <button
              onClick={() => window.history.back()}
              className="w-full bg-theme-tertiary text-theme-primary py-2 px-4 rounded-lg hover:bg-theme-quaternary transition-colors"
            >
              Go Back
            </button>
            
            <Link
              href="/"
              className="block w-full bg-theme-primary text-theme-secondary py-2 px-4 rounded-lg hover:bg-theme-secondary hover:text-theme-primary transition-colors border border-theme"
            >
              Go to Homepage
            </Link>
          </div>
          
          {process.env.NODE_ENV === 'development' && err && (
            <details className="mt-6 text-left">
              <summary className="text-error-color cursor-pointer mb-2">
                Debug Info (Development Only)
              </summary>
              <pre className="text-xs bg-theme-primary p-3 rounded overflow-auto max-h-40">
                {err.toString()}
                {err.stack && `\n${err.stack}`}
              </pre>
            </details>
          )}
        </div>
      </div>
    </>
  );
}

Error.getInitialProps = ({ res, err }) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
};

export default Error;