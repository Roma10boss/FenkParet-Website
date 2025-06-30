import React from 'react';
import Image from 'next/image';
import { useCart } from '../../context/CartContext';

const CartItem = ({ item }) => {
  const { updateQuantity, removeFromCart } = useCart();

  const handleQuantityChange = (e) => {
    const newQuantity = parseInt(e.target.value, 10);
    if (!isNaN(newQuantity)) {
      updateQuantity(item.id, newQuantity);
    }
  };

  return (
    <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 py-4">
      <div className="flex items-center space-x-4">
        <div className="relative w-20 h-20 flex-shrink-0">
          <Image
            src={item.image}
            alt={item.name}
            layout="fill"
            objectFit="cover"
            className="rounded-md"
          />
        </div>
        <div>
          <h3 className="font-semibold text-lg">{item.name}</h3>
          {item.variant && (
            <p className="text-sm text-gray-600 dark:text-gray-400">Variant: {item.variant.name}</p>
          )}
          <p className="text-gray-800 dark:text-gray-200">${item.price.toFixed(2)}</p>
        </div>
      </div>
      <div className="flex items-center space-x-4">
        <input
          type="number"
          min="1"
          value={item.quantity}
          onChange={handleQuantityChange}
          className="w-16 px-2 py-1 border rounded-md text-center dark:bg-gray-700"
        />
        <button
          onClick={() => removeFromCart(item.id)}
          className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-600"
        >
          Remove
        </button>
      </div>
    </div>
  );
};

export default CartItem;
