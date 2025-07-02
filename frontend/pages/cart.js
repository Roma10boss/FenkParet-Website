// pages/cart.js
import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useCart } from '../context/CartContext';
import CartItem from '../components/cart/CartItem';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/router';
import { 
  ShoppingBagIcon, 
  ArrowLeftIcon, 
  ShieldCheckIcon,
  CreditCardIcon,
  TruckIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

const CartPage = () => {
  const { items, getTotals, clearCart, isEmpty } = useCart();
  const { subtotal, tax, shipping, total, itemCount } = getTotals();
  const [confirmationNumber, setConfirmationNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handlePlaceOrder = async () => {
    if (!confirmationNumber.trim()) {
      toast.error('Veuillez entrer votre numéro de confirmation.');
      return;
    }
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const config = token ? {
        headers: { Authorization: `Bearer ${token}` }
      } : {};

      // Transform cart items to match backend format
      const cartData = items.map(item => ({
        productId: item.id,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        variant: item.variant || null
      }));

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders/place-order-with-confirmation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` })
        },
        body: JSON.stringify({
          cart: cartData,
          confirmationNumber,
          language: 'fr'
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erreur lors de la commande');
      }

      toast.success('Commande passée avec succès! Nous vérifierons votre numéro de confirmation.');
      clearCart();
      router.push('/user/orders');
    } catch (error) {
      console.error('Order placement error:', error);
      toast.error(error.message || 'Une erreur est survenue lors de la commande.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Panier - {process.env.NEXT_PUBLIC_SITE_NAME}</title>
        <meta name="description" content="Votre panier d'achats" />
      </Head>

      <div className="min-h-screen bg-theme-secondary">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <Link href="/products" className="btn-ghost p-2">
                <ArrowLeftIcon className="w-5 h-5" />
              </Link>
              <h1 className="text-3xl font-bold text-theme-primary flex items-center">
                <ShoppingBagIcon className="w-8 h-8 mr-3 text-accent" />
                Mon Panier
              </h1>
            </div>
            {!isEmpty() && (
              <div className="text-theme-secondary">
                {itemCount} {itemCount === 1 ? 'article' : 'articles'}
              </div>
            )}
          </div>

          {isEmpty() ? (
            /* Empty Cart State */
            <div className="text-center py-16">
              <div className="bg-theme-primary rounded-2xl shadow-lg p-12 max-w-md mx-auto">
                <ShoppingBagIcon className="w-24 h-24 text-theme-tertiary mx-auto mb-6" />
                <h2 className="text-2xl font-bold text-theme-primary mb-4">
                  Votre panier est vide
                </h2>
                <p className="text-theme-secondary mb-8">
                  Découvrez notre collection et trouvez quelque chose qui vous plaît !
                </p>
                <Link href="/products" className="btn-primary inline-flex items-center">
                  <ShoppingBagIcon className="w-5 h-5 mr-2" />
                  Commencer mes achats
                </Link>
              </div>
            </div>
          ) : (
            /* Cart Content */
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="xl:col-span-2 space-y-4">
                <div className="bg-theme-primary rounded-xl shadow-sm border border-theme p-6">
                  <h2 className="text-xl font-semibold text-theme-primary mb-6 flex items-center">
                    <ShoppingBagIcon className="w-5 h-5 mr-2 text-accent" />
                    Articles dans votre panier
                  </h2>
                  <div className="space-y-4">
                    {items.map((item, index) => (
                      <div key={item.id}>
                        <CartItem item={item} />
                        {index < items.length - 1 && (
                          <hr className="border-theme my-4" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Order Summary */}
              <div className="xl:col-span-1">
                <div className="bg-theme-primary rounded-xl shadow-sm border border-theme p-6 sticky top-8">
                  <h2 className="text-xl font-semibold text-theme-primary mb-6 flex items-center">
                    <CreditCardIcon className="w-5 h-5 mr-2 text-accent" />
                    Résumé de la commande
                  </h2>

                  {/* Price Breakdown */}
                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between text-theme-secondary">
                      <span>Sous-total ({itemCount} {itemCount === 1 ? 'article' : 'articles'})</span>
                      <span className="font-medium">{subtotal.toFixed(2)} HTG</span>
                    </div>
                    <div className="flex justify-between text-theme-secondary">
                      <span>Taxes</span>
                      <span className="font-medium">{tax.toFixed(2)} HTG</span>
                    </div>
                    <div className="flex justify-between text-theme-secondary">
                      <span className="flex items-center">
                        <TruckIcon className="w-4 h-4 mr-1" />
                        Livraison
                      </span>
                      <span className="font-medium">{shipping.toFixed(2)} HTG</span>
                    </div>
                    <hr className="border-theme" />
                    <div className="flex justify-between text-lg font-bold text-theme-primary">
                      <span>Total</span>
                      <span className="text-accent">{total.toFixed(2)} HTG</span>
                    </div>
                  </div>

                  {/* Payment Confirmation */}
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-theme-primary mb-3 flex items-center">
                      <ShieldCheckIcon className="w-5 h-5 mr-2 text-accent" />
                      Confirmation de paiement
                    </h3>
                    <div className="bg-theme-secondary rounded-lg p-4 mb-4">
                      <div className="flex items-start space-x-3">
                        <CheckCircleIcon className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm text-theme-primary font-medium mb-1">
                            Processus de commande sécurisé
                          </p>
                          <p className="text-xs text-theme-secondary">
                            Entrez votre numéro de confirmation de paiement. Notre équipe vérifiera votre paiement dans les 48 heures.
                          </p>
                        </div>
                      </div>
                    </div>
                    <input
                      type="text"
                      value={confirmationNumber}
                      onChange={(e) => setConfirmationNumber(e.target.value)}
                      placeholder="Numéro de confirmation"
                      className="w-full px-4 py-3 border border-theme-border rounded-lg bg-theme-input text-theme-primary placeholder-theme-tertiary focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all"
                    />
                  </div>

                  {/* Place Order Button */}
                  <button
                    onClick={handlePlaceOrder}
                    disabled={isLoading || !confirmationNumber.trim()}
                    className="w-full btn-primary py-4 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:shadow-lg"
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center">
                        <div className="spinner w-5 h-5 mr-2"></div>
                        Commande en cours...
                      </div>
                    ) : (
                      <div className="flex items-center justify-center">
                        <ShieldCheckIcon className="w-5 h-5 mr-2" />
                        Passer la commande
                      </div>
                    )}
                  </button>

                  {/* Trust Badges */}
                  <div className="mt-6 pt-6 border-t border-theme">
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div className="text-center">
                        <ShieldCheckIcon className="w-6 h-6 text-accent mx-auto mb-1" />
                        <p className="text-xs text-theme-tertiary">Paiement sécurisé</p>
                      </div>
                      <div className="text-center">
                        <TruckIcon className="w-6 h-6 text-accent mx-auto mb-1" />
                        <p className="text-xs text-theme-tertiary">Livraison rapide</p>
                      </div>
                      <div className="text-center">
                        <CheckCircleIcon className="w-6 h-6 text-accent mx-auto mb-1" />
                        <p className="text-xs text-theme-tertiary">Garanti</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default CartPage;