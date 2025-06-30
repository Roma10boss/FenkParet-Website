// pages/cart.js
import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import CartItem from '../components/cart/CartItem';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/router';
import api from '../utils/api'; // Assuming you have an API utility

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
    <div className="container mx-auto p-4">
      {isEmpty() ? (
        <p>Votre panier est vide. Commencez vos achats!</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            {items.map((item) => (
              <CartItem key={item.id} item={item} />
            ))}
          </div>
          <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg">
            <h2 className="text-2xl font-bold mb-4">Résumé de la commande</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Sous-total ({itemCount} {itemCount === 1 ? 'article' : 'articles'})</span>
                <span>{subtotal.toFixed(2)} HTG</span>
              </div>
              <div className="flex justify-between">
                <span>Taxes</span>
                <span>{tax.toFixed(2)} HTG</span>
              </div>
              <div className="flex justify-between">
                <span>Livraison</span>
                <span>{shipping.toFixed(2)} HTG</span>
              </div>
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>{total.toFixed(2)} HTG</span>
              </div>
            </div>
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-2">Confirmation de paiement</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Pour compléter votre commande, veuillez entrer le numéro de confirmation qui vous a été fourni. Un administrateur le vérifiera dans les 48 heures.
              </p>
              <input
                type="text"
                value={confirmationNumber}
                onChange={(e) => setConfirmationNumber(e.target.value)}
                placeholder="Entrez le numéro de confirmation"
                className="w-full px-4 py-2 border rounded-md dark:bg-gray-700"
              />
            </div>
            <div className="mt-6">
              <button
                onClick={handlePlaceOrder}
                disabled={isLoading || !confirmationNumber}
                className="w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
              >
                {isLoading ? 'Commande en cours...' : 'Passer la commande'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;
''