// context/TranslationContext.js
import { createContext, useContext, useState, useEffect } from 'react';

// Translation data
const translations = {
  fr: {
    // Navigation
    'navigation.home': 'Accueil',
    'navigation.products': 'Produits',
    'navigation.categories': 'Catégories',
    'navigation.contact': 'Contact',
    'navigation.about': 'À propos',
    'navigation.cart': 'Panier',
    'navigation.login': 'Connexion',
    'navigation.register': 'Inscription',
    'navigation.profile': 'Profil',
    'navigation.orders': 'Commandes',
    'navigation.logout': 'Déconnexion',
    'navigation.admin': 'Administration',
    'navigation.dashboard': 'Tableau de bord',
    
    // Home page
    'home.welcome': 'Bienvenue chez',
    'home.hero.subtitle': 'Votre marketplace de confiance pour des produits haïtiens de qualité',
    'home.exploreCategories': 'Explorez nos catégories',
    'home.categoriesDesc': 'Trouvez exactement ce que vous cherchez dans notre large gamme de catégories de produits.',
    'home.featuredProducts': 'Produits en vedette',
    'home.featuredProductsDesc': 'Découvrez nos produits les plus populaires, soigneusement sélectionnés pour leur qualité et leur valeur.',
    'home.newArrivals': 'Nouveautés',
    'home.newArrivalsDesc': 'Nouveaux arrivages rien que pour vous. Soyez les premiers à obtenir ces nouveaux produits incroyables.',
    
    // Products
    'product.addToCart': 'Ajouter au panier',
    'product.outOfStock': 'Rupture de stock',
    'product.lowStock': 'Stock faible',
    'product.reviews': 'avis',
    'product.featured': 'Produits en vedette',
    'product.viewAllProducts': 'Voir tous les produits',
    'product.viewAllFeatured': 'Voir tout en vedette',
    'product.freeShipping': 'Livraison gratuite',
    'product.quantity': 'Quantité',
    'product.freeShippingDesc': 'Livraison gratuite pour les commandes de plus de 1000 HTG',
    'product.securePayment': 'Paiement sécurisé',
    'product.securePaymentDesc': 'Paiement MonCash avec vérification administrateur',
    'product.qualityProducts': 'Produits de qualité',
    'product.qualityProductsDesc': 'Articles de qualité supérieure à des prix avantageux',
    
    // Categories
    'category.electronics': 'Électronique',
    'category.clothing': 'Vêtements',
    'category.homeGoods': 'Articles ménagers',
    'category.accessories': 'Accessoires',
    
    // Cart
    'cart.title': 'Panier',
    'cart.empty': 'Votre panier est vide. Commencez vos achats!',
    'cart.itemCount': 'article',
    'cart.itemCount_plural': 'articles',
    'cart.subtotal': 'Sous-total',
    'cart.tax': 'Taxes',
    'cart.shipping': 'Livraison',
    'cart.total': 'Total',
    'cart.checkout': 'Passer à la caisse',
    'cart.clearCart': 'Vider le panier',
    'cart.remove': 'Retirer',
    'cart.proceedToCheckout': 'Finaliser la commande',
    
    // Checkout
    'checkout.title': 'Commande',
    'checkout.orderSummary': 'Résumé de la commande',
    'checkout.billingAddress': 'Adresse de facturation',
    'checkout.shippingAddress': 'Adresse de livraison',
    'checkout.paymentMethod': 'Méthode de paiement',
    'checkout.placeOrder': 'Passer la commande',
    'checkout.orderPlaced': 'Commande passée avec succès!',
    'checkout.moncash': 'MonCash',
    'checkout.moncashDesc': 'Payez en toute sécurité avec MonCash',
    
    // User
    'user.profile': 'Mon profil',
    'user.orders': 'Mes commandes',
    'user.personalInfo': 'Informations personnelles',
    'user.changePassword': 'Changer le mot de passe',
    'user.preferences': 'Préférences',
    
    // Orders
    'order.orderHistory': 'Historique des commandes',
    'order.orderNumber': 'Numéro de commande',
    'order.status': 'Statut',
    'order.total': 'Total',
    'order.date': 'Date',
    'order.noOrders': 'Aucune commande trouvée',
    'order.trackOrder': 'Suivre votre commande',
    
    // Footer
    'footer.newsletter': 'Newsletter',
    'footer.newsletterDesc': 'Restez informé de nos derniers produits et offres.',
    'footer.subscribe': 'S\'abonner',
    'footer.emailPlaceholder': 'Votre email',
    'footer.allRightsReserved': 'Tous droits réservés.',
    'footer.madeWith': 'Fait avec',
    'footer.inHaiti': 'en Haïti',
    
    // Common
    'common.loading': 'Chargement...',
    'common.error': 'Erreur',
    'common.success': 'Succès',
    'common.cancel': 'Annuler',
    'common.save': 'Enregistrer',
    'common.edit': 'Modifier',
    'common.delete': 'Supprimer',
    'common.confirm': 'Confirmer',
    'common.close': 'Fermer',
    'common.back': 'Retour',
    'common.next': 'Suivant',
    'common.previous': 'Précédent',
    'common.search': 'Rechercher',
    'common.filter': 'Filtrer',
    'common.sort': 'Trier',
    'common.view': 'Voir',
    'common.new': 'NOUVEAU',
    'common.featured': 'EN VEDETTE',
    'common.products': 'produits',
    'common.continueShopping': 'Continuer les achats',
    'common.startShopping': 'Commencer les achats',
    'common.each': 'chacun',
    'common.or': 'ou',
    
    // Buttons
    'buttons.submit': 'Soumettre',
    'buttons.reset': 'Réinitialiser',
    'buttons.clear': 'Effacer',
    'buttons.apply': 'Appliquer',
    'buttons.update': 'Mettre à jour',
    'buttons.create': 'Créer',
    'buttons.add': 'Ajouter',
    'buttons.remove': 'Retirer',
    
    // Errors
    'error.generic': 'Une erreur s\'est produite',
    'error.network': 'Erreur de réseau',
    'error.404': 'Page non trouvée',
    'error.500': 'Erreur du serveur',
    'error.goHome': 'Aller à l\'accueil',
    'error.tryAgain': 'Réessayer',
    
    // Notifications
    'notifications.title': 'Notifications',
    'notifications.clearAll': 'Tout effacer',
    'notifications.empty': 'Aucune nouvelle notification.',
    
    // Messages
    'messages.loggedOutSuccessfully': 'Déconnexion réussie!',
    
    // Auth
    'auth.login': 'Se connecter',
    'auth.register': 'S\'inscrire',
    'auth.logout': 'Se déconnecter',
    'auth.email': 'Email',
    'auth.password': 'Mot de passe',
    'auth.confirmPassword': 'Confirmer le mot de passe',
    'auth.firstName': 'Prénom',
    'auth.lastName': 'Nom',
    'auth.phone': 'Téléphone',
    'auth.loginRequired': 'Vous devez être connecté pour accéder à cette page.'
  },
  
  en: {
    // Navigation
    'navigation.home': 'Home',
    'navigation.products': 'Products',
    'navigation.categories': 'Categories',
    'navigation.contact': 'Contact',
    'navigation.about': 'About',
    'navigation.cart': 'Cart',
    'navigation.login': 'Login',
    'navigation.register': 'Register',
    'navigation.profile': 'Profile',
    'navigation.orders': 'Orders',
    'navigation.logout': 'Logout',
    'navigation.admin': 'Admin',
    'navigation.dashboard': 'Dashboard',
    
    // Home page
    'home.welcome': 'Welcome to',
    'home.hero.subtitle': 'Your trusted marketplace for quality Haitian products',
    'home.exploreCategories': 'Explore Our Categories',
    'home.categoriesDesc': 'Find exactly what you are looking for across a wide range of product categories.',
    'home.featuredProducts': 'Featured Products',
    'home.featuredProductsDesc': 'Check out our most popular products, carefully selected for quality and value.',
    'home.newArrivals': 'New Arrivals',
    'home.newArrivalsDesc': 'Fresh arrivals just for you. Be the first to get these amazing new products.',
    
    // Products
    'product.addToCart': 'Add to Cart',
    'product.outOfStock': 'Out of Stock',
    'product.lowStock': 'Low Stock',
    'product.reviews': 'reviews',
    'product.featured': 'Featured Products',
    'product.viewAllProducts': 'View All Products',
    'product.viewAllFeatured': 'View All Featured',
    'product.freeShipping': 'Free Shipping',
    'product.quantity': 'Quantity',
    'product.freeShippingDesc': 'Free shipping on orders over 1000 HTG',
    'product.securePayment': 'Secure Payment',
    'product.securePaymentDesc': 'MonCash payment with admin verification',
    'product.qualityProducts': 'Quality Products',
    'product.qualityProductsDesc': 'Premium quality items at great prices',
    
    // Categories
    'category.electronics': 'Electronics',
    'category.clothing': 'Clothing',
    'category.homeGoods': 'Home Goods',
    'category.accessories': 'Accessories',
    
    // Cart
    'cart.title': 'Cart',
    'cart.empty': 'Your cart is empty. Start shopping!',
    'cart.itemCount': 'item',
    'cart.itemCount_plural': 'items',
    'cart.subtotal': 'Subtotal',
    'cart.tax': 'Tax',
    'cart.shipping': 'Shipping',
    'cart.total': 'Total',
    'cart.checkout': 'Checkout',
    'cart.clearCart': 'Clear Cart',
    'cart.remove': 'Remove',
    'cart.proceedToCheckout': 'Proceed to Checkout',
    
    // Checkout
    'checkout.title': 'Checkout',
    'checkout.orderSummary': 'Order Summary',
    'checkout.billingAddress': 'Billing Address',
    'checkout.shippingAddress': 'Shipping Address',
    'checkout.paymentMethod': 'Payment Method',
    'checkout.placeOrder': 'Place Order',
    'checkout.orderPlaced': 'Order Placed Successfully!',
    'checkout.moncash': 'MonCash',
    'checkout.moncashDesc': 'Pay securely with MonCash',
    
    // User
    'user.profile': 'My Profile',
    'user.orders': 'My Orders',
    'user.personalInfo': 'Personal Information',
    'user.changePassword': 'Change Password',
    'user.preferences': 'Preferences',
    
    // Orders
    'order.orderHistory': 'Order History',
    'order.orderNumber': 'Order Number',
    'order.status': 'Status',
    'order.total': 'Total',
    'order.date': 'Date',
    'order.noOrders': 'No Orders Found',
    'order.trackOrder': 'Track Your Order',
    
    // Footer
    'footer.newsletter': 'Newsletter',
    'footer.newsletterDesc': 'Stay updated with our latest products and offers.',
    'footer.subscribe': 'Subscribe',
    'footer.emailPlaceholder': 'Your email',
    'footer.allRightsReserved': 'All rights reserved.',
    'footer.madeWith': 'Made with',
    'footer.inHaiti': 'in Haiti',
    
    // Common
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
    'common.cancel': 'Cancel',
    'common.save': 'Save',
    'common.edit': 'Edit',
    'common.delete': 'Delete',
    'common.confirm': 'Confirm',
    'common.close': 'Close',
    'common.back': 'Back',
    'common.next': 'Next',
    'common.previous': 'Previous',
    'common.search': 'Search',
    'common.filter': 'Filter',
    'common.sort': 'Sort',
    'common.view': 'View',
    'common.new': 'NEW',
    'common.featured': 'FEATURED',
    'common.products': 'products',
    'common.continueShopping': 'Continue Shopping',
    'common.startShopping': 'Start Shopping',
    'common.each': 'each',
    'common.or': 'or',
    
    // Buttons
    'buttons.submit': 'Submit',
    'buttons.reset': 'Reset',
    'buttons.clear': 'Clear',
    'buttons.apply': 'Apply',
    'buttons.update': 'Update',
    'buttons.create': 'Create',
    'buttons.add': 'Add',
    'buttons.remove': 'Remove',
    
    // Errors
    'error.generic': 'An error occurred',
    'error.network': 'Network error',
    'error.404': 'Page Not Found',
    'error.500': 'Server Error',
    'error.goHome': 'Go to Homepage',
    'error.tryAgain': 'Try Again',
    
    // Notifications
    'notifications.title': 'Notifications',
    'notifications.clearAll': 'Clear All',
    'notifications.empty': 'No new notifications.',
    
    // Messages
    'messages.loggedOutSuccessfully': 'Logged out successfully!',
    
    // Auth
    'auth.login': 'Login',
    'auth.register': 'Register',
    'auth.logout': 'Logout',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.confirmPassword': 'Confirm Password',
    'auth.firstName': 'First Name',
    'auth.lastName': 'Last Name',
    'auth.phone': 'Phone',
    'auth.loginRequired': 'You must be logged in to view this page.'
  }
};

const TranslationContext = createContext();

export const TranslationProvider = ({ children }) => {
  // Set French as primary language
  const [language, setLanguage] = useState('fr');
  const [isLoading, setIsLoading] = useState(false);

  // Load saved language preference from localStorage
  useEffect(() => {
    const savedLanguage = localStorage.getItem('language');
    if (savedLanguage && (savedLanguage === 'fr' || savedLanguage === 'en')) {
      setLanguage(savedLanguage);
    }
  }, []);

  // Save language preference to localStorage
  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  const changeLanguage = async (newLanguage) => {
    if (newLanguage === language) return;
    
    setIsLoading(true);
    
    // Simulate async language change (could be used for loading remote translations)
    await new Promise(resolve => setTimeout(resolve, 200));
    
    setLanguage(newLanguage);
    setIsLoading(false);
  };

  const t = (key, fallback = null) => {
    const keys = key.split('.');
    let value = translations[language];
    
    for (const k of keys) {
      if (value && typeof value === 'object') {
        value = value[k];
      } else {
        value = undefined;
        break;
      }
    }
    
    // If translation not found, try English as fallback
    if (value === undefined && language !== 'en') {
      let englishValue = translations['en'];
      for (const k of keys) {
        if (englishValue && typeof englishValue === 'object') {
          englishValue = englishValue[k];
        } else {
          englishValue = undefined;
          break;
        }
      }
      value = englishValue;
    }
    
    return value || fallback || key;
  };

  const formatCurrency = (amount) => {
    if (language === 'fr') {
      return `${amount.toFixed(2)} HTG`;
    }
    return `$${amount.toFixed(2)}`;
  };

  const formatDate = (date) => {
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    
    return new Date(date).toLocaleDateString(
      language === 'fr' ? 'fr-HT' : 'en-US', 
      options
    );
  };

  const value = {
    language,
    setLanguage,
    changeLanguage,
    t,
    formatCurrency,
    formatDate,
    isLoading,
    availableLanguages: [
      { code: 'fr', name: 'Français', flag: '🇭🇹' },
      { code: 'en', name: 'English', flag: '🇺🇸' }
    ]
  };

  return (
    <TranslationContext.Provider value={value}>
      {children}
    </TranslationContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(TranslationContext);
  if (!context) {
    throw new Error('useTranslation must be used within a TranslationProvider');
  }
  return context;
};

export default TranslationProvider;