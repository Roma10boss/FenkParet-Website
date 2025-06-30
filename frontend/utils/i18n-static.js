// Client-side internationalization for static export
import { useEffect, useState } from 'react';

// Language detection and management
export const useLanguage = () => {
  const [language, setLanguage] = useState('fr'); // Default to French for Haiti
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Get saved language or detect from browser
    const savedLanguage = localStorage.getItem('language');
    const browserLanguage = navigator.language.startsWith('fr') ? 'fr' : 'en';
    const detectedLanguage = savedLanguage || browserLanguage;
    
    setLanguage(detectedLanguage);
    setMounted(true);
  }, []);

  const changeLanguage = (newLanguage) => {
    setLanguage(newLanguage);
    localStorage.setItem('language', newLanguage);
  };

  return { language, changeLanguage, mounted };
};

// Translation function
export const t = (key, language = 'fr') => {
  // Get translation from existing TranslationContext
  if (typeof window !== 'undefined' && window.__translations) {
    return window.__translations[language]?.[key] || key;
  }
  
  // Fallback translations for common keys
  const fallbackTranslations = {
    fr: {
      'navigation.home': 'Accueil',
      'navigation.products': 'Produits',
      'navigation.cart': 'Panier',
      'navigation.login': 'Connexion',
      'navigation.admin': 'Administration',
      'product.addToCart': 'Ajouter au panier',
      'product.outOfStock': 'Rupture de stock',
      'cart.total': 'Total',
      'checkout.placeOrder': 'Passer la commande',
    },
    en: {
      'navigation.home': 'Home',
      'navigation.products': 'Products',
      'navigation.cart': 'Cart',
      'navigation.login': 'Login',
      'navigation.admin': 'Admin',
      'product.addToCart': 'Add to Cart',
      'product.outOfStock': 'Out of Stock',
      'cart.total': 'Total',
      'checkout.placeOrder': 'Place Order',
    }
  };

  return fallbackTranslations[language]?.[key] || key;
};

// Language switcher component
export const LanguageSwitcher = () => {
  const { language, changeLanguage, mounted } = useLanguage();

  if (!mounted) return null;

  return (
    <div className="flex items-center space-x-1">
      <button
        onClick={() => changeLanguage('fr')}
        className={`px-2 py-1 text-xs rounded ${
          language === 'fr' 
            ? 'bg-blue-600 text-white' 
            : 'text-gray-600 hover:text-blue-600'
        }`}
      >
        FR
      </button>
      <button
        onClick={() => changeLanguage('en')}
        className={`px-2 py-1 text-xs rounded ${
          language === 'en' 
            ? 'bg-blue-600 text-white' 
            : 'text-gray-600 hover:text-blue-600'
        }`}
      >
        EN
      </button>
    </div>
  );
};

// Initialize translations on client side
export const initializeTranslations = (translations) => {
  if (typeof window !== 'undefined') {
    window.__translations = translations;
  }
};