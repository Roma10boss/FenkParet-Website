// components/layout/Header.js
'use client'; // Keep this directive if this component needs client-side rendering
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image'; // Assuming you use Next.js Image component
import { useRouter } from 'next/router'; // This import is correct
import { useAuth } from '../../hooks/useAuth'; // Assuming named export from useAuth.js
import { useCart } from '../../context/CartContext'; // Assuming named export from CartContext.js
import { useTheme } from '../../context/ThemeContext'; // Assuming named export from ThemeContext.js
import { toast } from 'react-hot-toast'; // Assuming named export from react-hot-toast
import {
  MagnifyingGlassIcon,
  SunIcon,
  MoonIcon,
  ShoppingCartIcon,
  UserCircleIcon,
  ChevronDownIcon,
  Bars3Icon,
  XMarkIcon,
  BellIcon, // Re-added BellIcon for notifications
} from '@heroicons/react/24/outline'; // Named imports for icons
import { useSocket } from '../../context/SocketContext'; // Re-added useSocket if you use it for notifications

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showSearchBar, setShowSearchBar] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false); // State for notifications dropdown
  const [searchQuery, setSearchQuery] = useState(''); // Search state
  const searchInputRef = useRef(null);
  const mobileSearchInputRef = useRef(null);
  const notificationsRef = useRef(null); // Ref for notifications dropdown

  const router = useRouter(); // FIX: Initialize useRouter hook here

  const { user, logout, isAuthenticated } = useAuth();
  const { getItemCount } = useCart();
  const { toggleTheme, isDark } = useTheme();
  const { notifications, markAsRead, clearNotification, getUnreadCount, clearAllNotifications } = useSocket(); // Re-added useSocket if needed for notifications
  const cartItemCount = getItemCount();
  const unreadNotificationsCount = getUnreadCount(); // If useSocket is re-added

  const handleLogout = async () => {
    await logout();
    toast.success('Déconnexion réussie!');
    router.push('/');
  };

  // Handle search functionality
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Navigate to products page with search query
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setShowSearchBar(false); // Close mobile search
      setSearchQuery(''); // Clear search after navigation
    }
  };

  const handleSearchInput = (value) => {
    setSearchQuery(value);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch(e);
    }
  };

  // Handle click outside for notification dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target) &&
          !event.target.closest('.notification-toggle')) { // Add a class to the bell icon button for this
        setIsNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isNotificationsOpen]);


  const menuItems = [
    { name: 'Accueil', href: '/' },
    { name: 'Produits', href: '/products' },
    { name: 'Nouveautés', href: '/nouveautes' },
    { name: 'Contact', href: '/contact' },
    { name: 'À propos', href: '/about' },
  ];

  useEffect(() => {
    if (showSearchBar && mobileSearchInputRef.current) {
      setTimeout(() => {
        mobileSearchInputRef.current.focus();
      }, 100); // Small delay to ensure the element is rendered
    }
  }, [showSearchBar]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        showUserMenu &&
        !e.target.closest('.user-menu-dropdown') &&
        !e.target.closest('.user-menu-toggle')
      ) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showUserMenu]);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [router.asPath]); // router is now defined here

  return (
    <header className="bg-theme-primary text-theme-primary shadow-sm border-b border-theme sticky top-0 z-50 theme-transition">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 min-h-[4rem]">
          {/* Logo + Navigation - Fixed flex-shrink to prevent compression */}
          <div className="flex items-center min-w-0 flex-1 lg:flex-initial">
            <Link
              href="/"
              className="text-xl font-bold text-theme-primary hover:text-accent transition-colors flex-shrink-0"
            >
              Fenkparet
            </Link>

            {/* Desktop Navigation - Responsive spacing and text handling */}
            <nav className="hidden lg:flex ml-6 xl:ml-8 space-x-1 xl:space-x-3 overflow-hidden">
              {menuItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="nav-link px-2 py-2 text-sm font-medium whitespace-nowrap hover:bg-theme-secondary rounded-md transition-colors"
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>

          {/* Right section - Responsive spacing and proper flex handling */}
          <div className="flex items-center space-x-1 sm:space-x-2 lg:space-x-3 flex-shrink-0">
            {/* Desktop Search Bar - Responsive width */}
            <form onSubmit={handleSearch} className="hidden lg:flex relative items-center w-48 xl:w-64">
              <MagnifyingGlassIcon className="absolute left-3 h-5 w-5 text-theme-secondary pointer-events-none" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearchInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Rechercher..."
                className="pl-10 pr-12 py-2 w-full rounded-md border border-theme-border bg-theme-input text-theme-primary placeholder-theme-tertiary focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent text-sm"
              />
              <button type="submit" className="absolute right-2 p-1 text-theme-secondary hover:text-accent transition-colors">
                <MagnifyingGlassIcon className="h-4 w-4" />
              </button>
            </form>

            {/* Mobile Search Toggle */}
            <button
              onClick={() => setShowSearchBar(!showSearchBar)}
              className="lg:hidden btn-ghost p-2"
              aria-label="Search"
            >
              <MagnifyingGlassIcon className="w-5 h-5 text-theme-secondary" />
            </button>


            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="btn-ghost p-2 theme-toggle-btn"
              aria-label="Toggle theme"
            >
              {isDark ? (
                <SunIcon className="w-4 h-4 sm:w-5 sm:h-5" />
              ) : (
                <MoonIcon className="w-4 h-4 sm:w-5 sm:h-5" />
              )}
            </button>

            {/* Notifications Icon (if useSocket is active) */}
            {user && ( // Only show notifications if a user is logged in
              <div className="relative" ref={notificationsRef}>
                <button
                  onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                  className="p-2 rounded-full hover:bg-theme-secondary transition-colors relative notification-toggle"
                  aria-label="Notifications"
                >
                  <BellIcon className="w-6 h-6 text-theme-secondary" />
                  {unreadNotificationsCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-error-color text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                      {unreadNotificationsCount > 99 ? '99+' : unreadNotificationsCount}
                    </span>
                  )}
                </button>
                {isNotificationsOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-theme-primary rounded-lg shadow-lg border border-theme z-50">
                    <div className="p-4 border-b border-theme flex justify-between items-center">
                      <h3 className="font-semibold text-lg">Notifications</h3>
                      <button onClick={clearAllNotifications} className="text-sm text-theme-tertiary hover:text-accent">
                        Tout effacer
                      </button>
                    </div>
                    <div className="max-h-60 overflow-y-auto">
                      {notifications && notifications.length === 0 ? (
                        <p className="text-center text-theme-tertiary p-4">Aucune nouvelle notification.</p>
                      ) : (
                        notifications && notifications.map((notif) => (
                          <div
                            key={notif.id}
                            onClick={() => markAsRead(notif.id)}
                            className={`p-3 border-b border-theme last:border-b-0 cursor-pointer ${
                              notif.read ? 'bg-theme-secondary text-theme-tertiary' : 'bg-theme-bg hover:bg-theme-secondary'
                            }`}
                          >
                            <p className={`font-medium ${notif.read ? 'text-theme-tertiary' : 'text-theme-primary'}`}>
                              {notif.message}
                            </p>
                            <span className="text-xs text-theme-tertiary">
                              {new Date(notif.timestamp).toLocaleString()}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}


            {/* Shopping Cart */}
            <Link
              href="/cart"
              className="btn-ghost p-2 relative group"
              aria-label="Shopping cart"
            >
              <ShoppingCartIcon className="w-4 h-4 sm:w-5 sm:h-5 text-theme-secondary" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-accent text-accent-contrast text-xs rounded-full h-4 w-4 sm:h-5 sm:w-5 flex items-center justify-center font-bold animate-pulse min-w-[1rem] sm:min-w-[1.25rem]">
                  {cartItemCount > 99 ? '99+' : cartItemCount}
                </span>
              )}
            </Link>

            {/* User Auth Menu - Responsive design */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="user-menu-toggle flex items-center space-x-1 sm:space-x-2 btn-ghost px-2 py-2"
                  aria-label="User menu"
                >
                  <UserCircleIcon className="w-4 h-4 sm:w-5 sm:h-5 text-accent flex-shrink-0" />
                  <span className="hidden md:block text-sm font-medium max-w-[60px] lg:max-w-[80px] truncate text-theme-primary">
                    {user?.name || 'User'}
                  </span>
                  <ChevronDownIcon
                    className={`w-3 h-3 sm:w-4 sm:h-4 text-theme-secondary transition-transform flex-shrink-0 ${
                      showUserMenu ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {showUserMenu && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
                    <div className="user-menu-dropdown absolute right-0 mt-2 w-56 rounded-xl shadow-lg z-50 bg-theme-primary border border-theme animate-fade-in-scale">
                      <div className="py-2">
                        <div className="px-4 py-3 border-b border-theme">
                          <p className="text-sm font-medium text-theme-primary truncate">
                            {user?.name || 'User'}
                          </p>
                          <p className="text-xs text-theme-tertiary truncate">{user?.email}</p>
                        </div>
                        <Link href="/user/profile" className="block px-4 py-2 text-sm nav-link">
                          Profil
                        </Link>
                        <Link href="/user/orders" className="block px-4 py-2 text-sm nav-link">
                          Mes commandes
                        </Link>
                        {user?.isAdmin && (
                          <Link
                            href="/admin/dashboard"
                            className="block px-4 py-2 text-sm nav-link"
                          >
                            Administration
                          </Link>
                        )}
                        <hr className="my-2 border-theme" />
                        <button
                          onClick={() => {
                            logout();
                            setShowUserMenu(false);
                          }}
                          className="block w-full text-left px-4 py-2 text-sm nav-link"
                        >
                          Déconnexion
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <Link href="/auth/login" className="btn-primary text-sm px-3 py-2 whitespace-nowrap">
                Connexion
              </Link>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden btn-ghost p-2 ml-1"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <XMarkIcon className="w-5 h-5 sm:w-6 sm:h-6 text-theme-secondary" />
              ) : (
                <Bars3Icon className="w-5 h-5 sm:w-6 sm:h-6 text-theme-secondary" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        {showSearchBar && (
          <div className="lg:hidden p-4 border-t border-theme animate-fade-in-down">
            <form onSubmit={handleSearch} className="relative flex items-center">
              <MagnifyingGlassIcon className="absolute left-3 h-5 w-5 text-theme-secondary pointer-events-none" />
              <input
                ref={mobileSearchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearchInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Rechercher..."
                className="pl-10 pr-12 py-2 w-full rounded-md border border-theme-border bg-theme-input text-theme-primary placeholder-theme-tertiary focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                autoFocus
              />
              <button type="submit" className="absolute right-2 p-1 text-theme-secondary hover:text-accent transition-colors">
                <MagnifyingGlassIcon className="h-4 w-4" />
              </button>
            </form>
          </div>
        )}

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-theme animate-fade-in-up">
            <div className="py-4 space-y-2">
              {menuItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="block py-3 px-2 nav-link rounded-md hover:bg-theme-secondary transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}

              {!isAuthenticated && (
                <div className="pt-4 border-t border-theme mt-4">
                  <Link
                    href="/auth/register"
                    className="block w-full btn-primary text-center"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Inscription
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header; // THIS IS THE ONLY EXPORT FOR THIS FILE
