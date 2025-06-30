import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, MinusIcon, PlusIcon, ShoppingBagIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '../../context/CartContext';

const CartSidebar = ({ isOpen, onClose }) => {
  const { 
    items, 
    updateQuantity, 
    removeFromCart, 
    clearCart, 
    getTotals, 
    getItemCount,
    isEmpty 
  } = useCart();
  const { t, formatCurrency } = useTranslation();

  const totals = getTotals();

  const handleQuantityChange = (itemId, newQuantity) => {
    if (newQuantity === 0) {
      removeFromCart(itemId);
    } else {
      updateQuantity(itemId, newQuantity);
    }
  };

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-in-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in-out duration-300"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
              <Transition.Child
                as={Fragment}
                enter="transform transition ease-in-out duration-300"
                enterFrom="translate-x-full"
                enterTo="translate-x-0"
                leave="transform transition ease-in-out duration-300"
                leaveFrom="translate-x-0"
                leaveTo="translate-x-full"
              >
                <Dialog.Panel className="pointer-events-auto w-screen max-w-md">
                  <div className="flex h-full flex-col bg-white dark:bg-gray-900 shadow-xl">
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-6 sm:px-6">
                      <Dialog.Title className="text-lg font-medium text-gray-900 dark:text-white">
                        Panier ({getItemCount()})
                      </Dialog.Title>
                      <div className="ml-3 flex h-7 items-center">
                        <button
                          type="button"
                          className="relative -m-2 p-2 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                          onClick={onClose}
                        >
                          <span className="absolute -inset-0.5" />
                          <span className="sr-only">Fermer</span>
                          <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                        </button>
                      </div>
                    </div>

                    {/* Cart Content */}
                    <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
                      {isEmpty() ? (
                        <EmptyCart onClose={onClose} />
                      ) : (
                        <>
                          {/* Cart Items */}
                          <div className="space-y-6">
                            {items.map((item) => (
                              <CartItem
                                key={item.id}
                                item={item}
                                onQuantityChange={handleQuantityChange}
                                onRemove={() => removeFromCart(item.id)}
                              />
                            ))}
                          </div>

                          {/* Clear Cart Button */}
                          <div className="mt-6">
                            <button
                              onClick={clearCart}
                              className="text-sm text-red-600 hover:text-red-500 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                            >
                              Vider le panier
                            </button>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Footer with totals and checkout */}
                    {!isEmpty() && (
                      <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-6 sm:px-6">
                        {/* Totals */}
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                            <span>Sous-total</span>
                            <span>{formatCurrency(totals.subtotal)}</span>
                          </div>
                          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                            <span>Livraison</span>
                            <span>
                              {totals.shipping === 0 ? (
                                <span className="text-green-600 dark:text-green-400">
                                  Livraison gratuite
                                </span>
                              ) : (
                                formatCurrency(totals.shipping)
                              )}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                            <span>Taxes</span>
                            <span>{formatCurrency(totals.tax)}</span>
                          </div>
                          <div className="flex justify-between text-base font-medium text-gray-900 dark:text-white border-t border-gray-200 dark:border-gray-700 pt-2">
                            <span>Total</span>
                            <span>{formatCurrency(totals.total)}</span>
                          </div>
                        </div>

                        {/* Checkout Button */}
                        <div className="mt-6">
                          <Link
                            href="/checkout"
                            onClick={onClose}
                            className="flex items-center justify-center rounded-md border border-transparent bg-primary-600 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-primary-700 transition-colors w-full"
                          >
                            Passer à la caisse
                          </Link>
                        </div>

                        {/* Continue Shopping */}
                        <div className="mt-6 flex justify-center text-center text-sm text-gray-500 dark:text-gray-400">
                          <p>
                            ou{' '}
                            <button
                              type="button"
                              className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300"
                              onClick={onClose}
                            >
                              Continuer les achats
                              <span aria-hidden="true"> &rarr;</span>
                            </button>
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
};

// Cart Item Component
const CartItem = ({ item, onQuantityChange, onRemove }) => {
  const { t, formatCurrency } = useTranslation();

  return (
    <div className="flex">
      {/* Product Image */}
      <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-200 dark:border-gray-700">
        {item.product.images && item.product.images.length > 0 ? (
          <Image
            src={item.product.images[0].url}
            alt={item.product.images[0].alt || item.product.name}
            width={96}
            height={96}
            className="h-full w-full object-cover object-center"
          />
        ) : (
          <div className="h-full w-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
            <ShoppingBagIcon className="h-8 w-8 text-gray-400" />
          </div>
        )}
      </div>

      {/* Product Details */}
      <div className="ml-4 flex flex-1 flex-col">
        <div className="flex justify-between text-base font-medium text-gray-900 dark:text-white">
          <h3>
            <Link
              href={`/products/${item.product._id}`}
              className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
            >
              {item.product.name}
            </Link>
          </h3>
          <p className="ml-4">{formatCurrency(item.price * item.quantity)}</p>
        </div>

        {/* Variant Info */}
        {item.variant && (
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {item.variant.name}: {item.variant.value}
          </p>
        )}

        {/* Price per unit */}
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {formatCurrency(item.price)} chacun
        </p>

        {/* Quantity Controls and Remove */}
        <div className="flex flex-1 items-end justify-between text-sm">
          <div className="flex items-center space-x-2">
            <label htmlFor={`quantity-${item.id}`} className="sr-only">
              Quantité
            </label>
            <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-md">
              <button
                type="button"
                onClick={() => onQuantityChange(item.id, item.quantity - 1)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                disabled={item.quantity <= 1}
              >
                <MinusIcon className="h-4 w-4" />
              </button>
              <span className="px-3 py-1 text-center min-w-[3rem]">
                {item.quantity}
              </span>
              <button
                type="button"
                onClick={() => onQuantityChange(item.id, item.quantity + 1)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <PlusIcon className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex">
            <button
              type="button"
              onClick={onRemove}
              className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300 transition-colors"
            >
              Retirer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Empty Cart Component
const EmptyCart = ({ onClose }) => {

  return (
    <div className="flex flex-col items-center justify-center py-12">
      <ShoppingBagIcon className="h-24 w-24 text-gray-300 dark:text-gray-600 mb-4" />
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
        Votre panier est vide
      </h3>
      <p className="text-gray-500 dark:text-gray-400 text-center mb-6">
        Ajoutez des produits pour commencer
      </p>
      <Link
        href="/products"
        onClick={onClose}
        className="btn btn-primary"
      >
        Commencer les achats
      </Link>
    </div>
  );
};

export default CartSidebar;