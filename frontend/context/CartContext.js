import { createContext, useContext, useReducer, useEffect, useState } from 'react'; 
import { toast } from 'react-hot-toast'; 

const CartContext = createContext();

// Cart reducer function
const cartReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_ITEM': {
      const { product, quantity = 1, selectedVariant = null } = action.payload;
      
      const itemId = selectedVariant ? `${product._id}-${selectedVariant.id}` : product._id;

      const existingItemIndex = state.items.findIndex(item => item.id === itemId);
      
      let newItems;
      if (existingItemIndex > -1) {
        newItems = state.items.map((item, index) =>
          index === existingItemIndex
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
        if (typeof window !== 'undefined') toast.success(`${quantity} more ${product.name} added to cart`);
      } else {
        const itemToAdd = {
          id: itemId,
          productId: product._id,
          name: product.name,
          price: selectedVariant?.price || product.pricing?.price || product.price, 
          image: product.images?.[0]?.url || '/placeholder-image.jpg',
          quantity,
          variant: selectedVariant,
          slug: product.slug,
        };
        newItems = [...state.items, itemToAdd];
        if (typeof window !== 'undefined') toast.success(`${product.name} added to cart`);
      }
      return { ...state, items: newItems };
    }
    
    case 'REMOVE_ITEM': {
      const newItems = state.items.filter(item => item.id !== action.payload);
      if (typeof window !== 'undefined') toast.success('Item removed from cart');
      return { ...state, items: newItems };
    }
    
    case 'UPDATE_QUANTITY': {
      const { id: itemId, quantity } = action.payload;
      if (quantity <= 0) {
        return {
          ...state,
          items: state.items.filter(item => item.id !== itemId),
        };
      }
      const newItems = state.items.map(item =>
        item.id === itemId
          ? { ...item, quantity: quantity }
          : item
      );
      return { ...state, items: newItems };
    }
    
    case 'CLEAR_CART': {
      if (typeof window !== 'undefined') toast.success('Cart cleared');
      return { ...state, items: [] };
    }
    
    case 'LOAD_CART': {
      return {
        ...state,
        items: action.payload,
      };
    }
    
    default:
      return state;
  }
};

// Initial state for the cart
const initialState = {
  items: [],
};

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        try {
          const cartItems = JSON.parse(savedCart);
          dispatch({ type: 'LOAD_CART', payload: cartItems });
        } catch (error) {
          console.error('Error loading cart from localStorage:', error);
          localStorage.removeItem('cart');
        }
      }
    }
  }, [mounted]);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem('cart', JSON.stringify(state.items));
    }
  }, [state.items, mounted]);

  const addToCart = (product, quantity = 1, selectedVariant = null) => {
    dispatch({ type: 'ADD_ITEM', payload: { product, quantity, selectedVariant } });
  };

  const removeFromCart = (itemId) => {
    dispatch({ type: 'REMOVE_ITEM', payload: itemId });
  };

  const updateQuantity = (itemId, quantity) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id: itemId, quantity } });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  const getTotals = () => {
    const subtotal = state.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    const itemCount = state.items.reduce((total, item) => total + item.quantity, 0);
    
    const tax = subtotal * 0.1; 
    const shipping = subtotal > 100 ? 0 : 10; 
    
    const total = subtotal + tax + shipping;
    
    return {
      subtotal,
      itemCount,
      tax,
      shipping,
      total,
    };
  };

  const getCartTotals = getTotals;

  const isEmpty = () => {
    return state.items.length === 0;
  };

  const isInCart = (productId, variantId = null) => {
    const itemId = variantId ? `${productId}-${variantId}` : productId;
    return state.items.some(item => item.id === itemId);
  };

  const getItemQuantity = (productId, variantId = null) => {
    const itemId = variantId ? `${productId}-${variantId}` : productId;
    const item = state.items.find(item => item.id === itemId);
    return item ? item.quantity : 0;
  };

  const getItemCount = () => {
    return state.items.reduce((total, item) => total + item.quantity, 0);
  };

  const value = {
    items: state.items,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotals,
    getCartTotals, 
    isEmpty,
    isInCart,
    getItemQuantity,
    getItemCount,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
