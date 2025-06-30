// components/product/ProductCard.js
import Image from 'next/image'; // Assuming you use Next.js Image component
import Link from 'next/link';
import { useCart } from '../../context/CartContext';
import { toast } from 'react-hot-toast';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();

  const handleAddToCart = () => {
    try {
      addToCart({
        id: product._id || product.id,
        name: product.name,
        price: product.price,
        image: product.images?.[0]?.url || product.image,
        quantity: 1
      });
      toast.success(`${product.name} ajouté au panier`);
    } catch (error) {
      toast.error('Erreur lors de l\'ajout au panier');
    }
  };

  // You might need a way to get translated product names/descriptions from your backend
  // For now, let's assume product.name and product.description are what you get from API.
  // If product names need to be translated on the frontend, you'd need a mapping or logic here.

  const getStatusLabel = (status) => {
    if (status === 'NEW') return 'NOUVEAU';
    if (status === 'FEATURED') return 'EN VEDETTE';
    if (status === 'LOW_STOCK') return 'Stock faible';
    return ''; // Or a default
  };

  return (
    <div className="product-card bg-gray-800 text-gray-100 rounded-lg overflow-hidden shadow-lg">
      {product.image && (
        <div className="relative h-48 w-full bg-gray-700 flex items-center justify-center">
          <Image src={product.image} alt={product.name} layout="fill" objectFit="cover" className="rounded-t-lg" />
          {(product.discount || product.status) && (
            <div className="absolute top-2 left-2 flex flex-wrap gap-1">
              {product.discount && (
                <span className="bg-red-600 text-white text-xs font-semibold px-2 py-1 rounded-full">
                  -{product.discount}%
                </span>
              )}
              {product.status && getStatusLabel(product.status) && (
                <span className="bg-blue-600 text-white text-xs font-semibold px-2 py-1 rounded-full">
                  {getStatusLabel(product.status)}
                </span>
              )}
              {product.lowStock && product.stock <= 10 && ( // Assuming lowStock is a boolean or check actual stock
                <span className="bg-yellow-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
                  {'low_stock'}
                </span>
              )}
            </div>
          )}
        </div>
      )}
      {!product.image && ( // Placeholder for missing image (as seen in screenshots)
        <div className="h-48 w-full bg-gray-700 flex items-center justify-center text-gray-400">
          <span className="text-6xl">🛒</span> {/* Placeholder cart icon */}
        </div>
      )}

      <div className="p-4 flex flex-col flex-grow">
        <h3 className="text-xl font-semibold mb-2">{product.name}</h3>
        <p className="text-lg font-bold text-green-400 mb-2">
          {product.price} HTG
          {product.oldPrice && (
            <span className="text-sm text-gray-400 line-through ml-2">{product.oldPrice} HTG</span>
          )}
        </p>
        <div className="flex items-center text-sm text-gray-400 mb-4">
          {/* Star ratings - you'd likely map these dynamically */}
          <span>⭐</span><span>⭐</span><span>⭐</span><span>⭐</span><span>☆</span> ({product.reviews} avis)
        </div>
        <button 
          onClick={handleAddToCart}
          className="mt-auto btn btn-primary flex items-center justify-center space-x-2 hover:bg-blue-600 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.5 13 5.6 13h9.4a1 1 0 000-2H5.6l.5-1-.91-6.54c-.06-.44-.39-.79-.84-.86L3 3H1a1 1 0 000 2h1zM8 14a2 2 0 100 4 2 2 0 000-4zm-2 2a2 2 114 0 2 2 0 01-4 0zm13-2a2 2 0 100 4 2 2 0 000-4zm-2 2a2 2 114 0 2 2 0 01-4 0z" />
          </svg>
          <span>Ajouter au panier</span>
        </button>
      </div>
    </div>
  );
};

export default ProductCard;