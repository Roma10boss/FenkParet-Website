// components/layout/Layout.js
import { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
// FIX: Changed to DEFAULT imports for Header and Footer
import Header from './Header'; // Now expects default export from Header.js
import Footer from './Footer'; // Now expects default export from Footer.js
import { useSocket } from '../../context/SocketContext'; // Assuming named export
import { useTheme } from '../../context/ThemeContext'; // Assuming named export
import { useAuth } from '../../hooks/useAuth'; // IMPORTANT: Use your custom useAuth hook (assuming named export)
import { LoadingPage } from '../ui/LoadingPage'; // FIX: Pointing to a dedicated LoadingPage component (named export)
import FeedbackWidget from '../FeedbackWidget'; // Testing feedback widget


// Back to Top Button Component (SSR-safe by checking typeof window)
const BackToTopButton = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (typeof window !== 'undefined' && window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('scroll', toggleVisibility);
      return () => window.removeEventListener('scroll', toggleVisibility);
    }
  }, []);

  const scrollToTop = () => {
    if (typeof window !== 'undefined') {
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    }
  };

  if (!isVisible) return null;

  return (
    <button
      onClick={scrollToTop}
      className="fixed bottom-4 right-4 bg-accent hover:bg-accent-hover text-accent-contrast p-3 rounded-full shadow-lg transition-all duration-300 z-40 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2"
      aria-label="Back to top"
    >
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M5 10l7-7m0 0l7 7m-7-7v18"
        />
      </svg>
    </button>
  );
};

// Page Transition Loader (SSR-safe by checking router.events)
const PageTransitionLoader = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleStart = () => setLoading(true);
    const handleComplete = () => setLoading(false);

    router.events.on('routeChangeStart', handleStart);
    router.events.on('routeChangeComplete', handleComplete);
    router.events.on('routeChangeError', handleComplete);

    return () => {
      router.events.off('routeChangeStart', handleStart);
      router.events.off('routeChangeComplete', handleComplete);
      router.events.off('routeChangeError', handleComplete);
    };
  }, [router]);

  if (!loading) return null;

  return (
    <div className="fixed top-0 left-0 w-full h-1 z-50">
      <div className="h-full accent-gradient animate-loading-bar" />
      <style jsx>{`
        @keyframes loading-bar {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-loading-bar {
          animation: loading-bar 1.5s infinite;
        }
      `}</style>
    </div>
  );
};


const Layout = ({ children, title, description, keywords, noIndex = false }) => {
  const router = useRouter();
  const { trackOrder } = useSocket();
  const { mounted: themeMounted } = useTheme(); // From theme context
  const { loading: authLoading } = useAuth(); // <-- Get loading state from useAuth

  // Default meta values with fallbacks
  const defaultTitle = 'Fenkparet';
  const defaultDescription = 'Quality products at great prices';
  const defaultKeywords = 'fenkparet, quality products, haitian products';

  const siteTitle = title ? `${title} | ${process.env.NEXT_PUBLIC_SITE_NAME || 'Fenkparet'}` : defaultTitle;
  const siteDescription = description || defaultDescription;
  const siteKeywords = keywords || defaultKeywords;

  // Track page views for analytics
  useEffect(() => {
    if (!router?.events) return;

    const handleRouteChange = (url) => {
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('config', process.env.NEXT_PUBLIC_GA_ID, {
          page_path: url,
        });
      }
    };

    router.events.on('routeChangeComplete', handleRouteChange);
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router?.events]);

  // Handle order tracking from URL params
  useEffect(() => {
    if (router?.query?.track && typeof router.query.track === 'string') {
      trackOrder(router.query.track);
    }
  }, [router?.query?.track, trackOrder]);

  // Show loading page if theme or auth is not ready
  if (!themeMounted || authLoading) {
    return <LoadingPage message="Loading application..." />;
  }

  return (
    <>
      <Head>
        <title>{siteTitle}</title>
        <meta name="description" content={siteDescription} />
        <meta name="keywords" content={siteKeywords} />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta charSet="utf-8" />

        {noIndex && <meta name="robots" content="noindex, nofollow" />}

        <meta property="og:type" content="website" />
        <meta property="og:title" content={siteTitle} />
        <meta property="og:description" content={siteDescription} />
        <meta property="og:locale" content="en_US" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={siteTitle} />
        <meta name="twitter:description" content={siteDescription} />

        <meta name="theme-color" content="#b8d2b3" />
        <meta name="application-name" content={process.env.NEXT_PUBLIC_SITE_NAME || 'Fenkparet'} />

        <link rel="icon" href="/favicon.ico" />
        <link rel="canonical" href={`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}${router?.asPath || ''}`} />
      </Head>

      <div className="min-h-screen flex flex-col bg-theme-primary text-theme-primary theme-transition">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 bg-accent text-accent-contrast px-4 py-2 z-50 transition-all"
        >
          Skip to main content
        </a>

        {/* Pass necessary props to Header for responsive layout */}
        <Header
          className="sticky top-0 z-40 w-full bg-theme-primary border-b border-theme-border"
          locale="en"
        />

        <main
          id="main-content"
          className="flex-1 focus:outline-none"
          tabIndex="-1"
          role="main"
        >
          {children}
        </main>

        <Footer />

        <BackToTopButton />
        <PageTransitionLoader />
        
        {/* Feedback Widget for Testing */}
        <FeedbackWidget />
      </div>
    </>
  );
};

export default Layout; // <-- THIS IS THE ONLY EXPORT FOR THIS FILE
