import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
// Correct path to Layout
import Layout from '../components/layout/Layout';
// Correct path to Checkout component (assuming it's in components/cart)
import CheckoutComponent from '../components/cart/Checkout'; // Renamed to CheckoutComponent to avoid conflict with page name
import { useCart } from '../context/CartContext';
// IMPORTANT: Add useTheme for mounted state and theme-aware classes
import { useTheme } from '../context/ThemeContext'; 

export default function CheckoutPage() {
  const router = useRouter();
  const { isEmpty, getItemCount } = useCart();
  // Get `mounted` state from ThemeContext to ensure client-side operations are safe
  const { mounted: themeMounted } = useTheme(); 

  // Redirect to cart if no items, only on client and after mounted
  useEffect(() => {
    if (themeMounted && isEmpty()) {
      router.push('/cart');
    }
  }, [isEmpty, router, themeMounted]);

  // If not mounted yet, or cart is empty (and redirecting), return null or a loading state
  if (!themeMounted || isEmpty()) {
    // Layout will handle its own loading, but for a fast redirect case
    // we return null here to avoid rendering the checkout form prematurely
    // or when the cart is empty.
    return (
      <Layout title="Checkout">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h1 className="text-2xl font-bold text-theme-primary mb-4"> {/* Use theme color */}
            Your cart is empty
          </h1>
          <p className="text-theme-secondary mb-8"> {/* Use theme color */}
            Add some items to your cart before proceeding to checkout.
          </p>
          <button
            onClick={() => router.push('/products')}
            className="btn-primary" // Use theme-aware btn class
          >
            Continue Shopping
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <>
      <Head>
        <title>{'checkout.checkout'} | {process.env.NEXT_PUBLIC_SITE_NAME}</title>
        <meta name="description" content="Complete your purchase securely with payment" />
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <Layout>
        <div className="bg-theme-primary min-h-screen theme-transition"> {/* Use theme color */}
          {/* Header */}
          <div className="bg-theme-secondary border-b border-theme"> {/* Use theme colors */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-theme-primary"> {/* Use theme color */}
                  {'checkout.checkout' || 'Checkout'}
                </h1>
                <div className="text-sm text-theme-secondary"> {/* Use theme color */}
                  {getItemCount()} {getItemCount() === 1 ? 'common.item' || 'item' : 'common.items' || 'items'} {'checkout.inCart' || 'in cart'}
                </div>
              </div>
            </div>
          </div>

          {/* Actual Checkout Component (assuming this is your main checkout logic) */}
          <CheckoutComponent />
        </div>
      </Layout>
    </>
  );
}
