// pages/_app.js
import { useEffect, Component } from 'react';
import { useRouter } from 'next/router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import Head from 'next/head';

// Layouts - FIX: Changed back to default imports to match default exports in Layout.js and AdminLayout.js
import Layout from '../components/layout/Layout'; // Changed to default import
import AdminLayout from '../components/admin/AdminLayout'; // Changed to default import

// Context providers (these remain named imports as per your existing code, assuming they are named exports)
import { AuthProvider } from '../hooks/useAuth';
import { SocketProvider } from '../context/SocketContext';
import { CartProvider } from '../context/CartContext';
import { ThemeProvider } from '../context/ThemeContext';
import { TranslationProvider } from '../context/TranslationContext';

// Styles
import '../styles/globals.css';
import '../styles/admin.css';

// Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000,
    },
  },
});

// Error boundary to catch rendering issues
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', textAlign: 'center', color: 'red', backgroundColor: '#fee' }}>
          <h2>Something went wrong during rendering.</h2>
          <p>Please try refreshing the page. If the issue persists, contact support.</p>
          {process.env.NODE_ENV === 'development' && (
            <details style={{ whiteSpace: 'pre-wrap', textAlign: 'left', marginTop: '20px', border: '1px solid #fcc', padding: '10px' }}>
              {this.state.error && this.state.error.toString()}
              <br />
              {this.state.errorInfo && this.state.errorInfo.componentStack}
            </details>
          )}
        </div>
      );
    }
    return this.props.children;
  }
}

function MyApp({ Component, pageProps }) {
  const router = useRouter();
  const { pathname } = router;
  const isAdminPage = pathname.startsWith('/admin');
  const isAdminLoginPage = pathname === '/admin/login';
  const isAuthPage = pathname.startsWith('/auth');

  useEffect(() => {
    const jssStyles = document.querySelector('#jss-server-side');
    if (jssStyles) jssStyles.parentElement.removeChild(jssStyles);

    const handleGlobalError = (event) => console.error('Global error:', event.error);
    const handleUnhandledRejection = (event) => console.error('Unhandled promise rejection:', event.reason);
    window.addEventListener('error', handleGlobalError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleGlobalError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'performance' in window) {
      window.addEventListener('load', () => {
        setTimeout(() => {
          const perfData = performance.getEntriesByType('navigation')[0];
          if (perfData) {
            console.log(`Page load time: ${perfData.loadEventEnd - perfData.loadEventStart}ms`);
          }
        }, 0);
      });
    }
  }, [pathname]);

  // --- DIAGNOSTIC LOGS START (Keep these for now, remove once everything works) ---
  console.log('--- Checking components in _app.js ---');
  console.log('Layout (after import change):', Layout);
  console.log('AdminLayout (after import change):', AdminLayout);
  console.log('AuthProvider:', AuthProvider);
  console.log('SocketProvider:', SocketProvider);
  console.log('CartProvider:', CartProvider);
  console.log('ThemeProvider:', ThemeProvider);
  console.log('Toaster:', Toaster);
  console.log('--- End checking components in _app.js ---');
  // --- DIAGNOSTIC LOGS END ---

  return (
    <QueryClientProvider client={queryClient}>
      <Head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#b8d2b3" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <ErrorBoundary>
        <TranslationProvider>
          <AuthProvider>
            <SocketProvider>
              <CartProvider>
                  <ThemeProvider>
                  {isAdminPage && !isAdminLoginPage ? (
                    <AdminLayout>
                      <Component {...pageProps} />
                    </AdminLayout>
                  ) : isAdminLoginPage ? (
                    <Component {...pageProps} />
                  ) : (
                    <Layout>
                      <Component {...pageProps} />
                    </Layout>
                  )}
                  <Toaster
                    position="top-right"
                    toastOptions={{
                      duration: 4000,
                      style: {
                        background: 'var(--bg-tertiary)',
                        color: 'var(--text-primary)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '8px',
                        fontSize: '14px',
                        maxWidth: '500px',
                        padding: '12px 16px',
                      },
                      success: {
                        duration: 3000,
                        iconTheme: { primary: 'var(--success-color)', secondary: 'white' },
                        style: { background: 'var(--success-light)', color: 'var(--success-color)' },
                      },
                      error: {
                        duration: 4000,
                        iconTheme: { primary: 'var(--error-color)', secondary: 'white' },
                        style: { background: 'var(--error-light)', color: 'var(--error-color)' },
                      },
                      loading: {
                        duration: Infinity,
                        iconTheme: { primary: 'var(--info-color)', secondary: 'white' },
                        style: { background: 'var(--info-light)', color: 'var(--info-color)' },
                      },
                    }}
                    containerStyle={{ top: '20px', right: '20px' }}
                  />
                </ThemeProvider>
              </CartProvider>
            </SocketProvider>
          </AuthProvider>
        </TranslationProvider>
      </ErrorBoundary>
    </QueryClientProvider>
  );
}

export default MyApp;
