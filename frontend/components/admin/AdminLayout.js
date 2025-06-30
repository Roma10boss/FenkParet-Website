// components/admin/AdminLayout.js
    import React, { useState, useEffect } from 'react';
    import Link from 'next/link';
    import dynamic from 'next/dynamic';
    import { useRouter } from 'next/router';
    import { useAuth } from '../../hooks/useAuth';
    import { useTheme } from '../../context/ThemeContext';
    import { 
      SunIcon, 
      Bars3Icon, 
      XMarkIcon,
      ChartBarIcon,
      CubeIcon,
      DocumentTextIcon,
      EnvelopeIcon,
      UsersIcon,
      BellIcon,
      Cog6ToothIcon
    } from '@heroicons/react/24/outline';
    
    // Fallback for ArrowRightOnRectangleIcon if it doesn't exist
    const LogoutIcon = () => (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
      </svg>
    );

    // Dynamically import ThemeToggle (now a default export)
    const DynamicThemeToggle = dynamic(
      () => import('../../components/ui/ThemeToggle'), // Path to your ThemeToggle component
      {
        ssr: false,
        loading: () => (
          <div className="w-10 h-10 p-2 rounded-lg bg-theme-secondary border border-theme animate-pulse flex items-center justify-center">
            <SunIcon className="w-5 h-5 text-accent" />
          </div>
        ),
      }
    );

    const AdminLayout = ({ children }) => {
      const router = useRouter();
      const { user, isAuthenticated, isAdmin, logout, loading: authLoading } = useAuth(); // <-- Get auth state
      const { mounted: themeMounted } = useTheme(); // Get mounted state from ThemeContext
      
      // Redirect non-admin users to login
      useEffect(() => {
        if (!authLoading && themeMounted) {
          if (!isAuthenticated) {
            console.log('❌ Not authenticated, redirecting to admin login');
            router.push('/admin/login');
            return;
          }
          
          if (!isAdmin) {
            console.log('❌ Not admin user, redirecting to home');
            router.push('/');
            return;
          }
          
          console.log('✅ Admin access granted for:', user?.email);
        }
      }, [authLoading, themeMounted, isAuthenticated, isAdmin, router, user]);

      const [sidebarOpen, setSidebarOpen] = useState(false);
      const [notifications] = useState(3); // Mock notification count
      const [showNotifications, setShowNotifications] = useState(false);
      const [showSettings, setShowSettings] = useState(false);

      // Close dropdowns when clicking outside
      useEffect(() => {
        const handleClickOutside = (event) => {
          if (!event.target.closest('.dropdown-container')) {
            setShowNotifications(false);
            setShowSettings(false);
          }
        };

        if (showNotifications || showSettings) {
          document.addEventListener('mousedown', handleClickOutside);
          return () => document.removeEventListener('mousedown', handleClickOutside);
        }
      }, [showNotifications, showSettings]);

      // Handle escape key to close dropdowns
      useEffect(() => {
        const handleEscapeKey = (event) => {
          if (event.key === 'Escape') {
            setShowNotifications(false);
            setShowSettings(false);
          }
        };

        if (showNotifications || showSettings) {
          document.addEventListener('keydown', handleEscapeKey);
          return () => document.removeEventListener('keydown', handleEscapeKey);
        }
      }, [showNotifications, showSettings]);

      const navItems = [
        { name: 'Dashboard', href: '/admin/dashboard', icon: ChartBarIcon },
        { name: 'Products', href: '/admin/products', icon: CubeIcon },
        { name: 'Orders', href: '/admin/orders', icon: DocumentTextIcon },
        { name: 'Tickets', href: '/admin/tickets', icon: EnvelopeIcon },
        { name: 'Users', href: '/admin/users', icon: UsersIcon },
      ];

      const handleLogout = () => {
        logout();
        router.push('/admin/login');
      };

      // Show loading state if theme or auth is not ready
      if (!themeMounted || authLoading) {
        return (
          <div className="min-h-screen bg-theme-primary flex items-center justify-center">
            <div className="text-center">
              <div className="spinner w-12 h-12 mx-auto mb-4"></div>
              <p className="text-theme-secondary">Loading dashboard...</p>
            </div>
          </div>
        );
      }

      // Don't render admin panel if user is not authenticated or not admin
      if (!isAuthenticated || !isAdmin) {
        return (
          <div className="min-h-screen bg-theme-primary flex items-center justify-center">
            <div className="text-center">
              <div className="spinner w-12 h-12 mx-auto mb-4"></div>
              <p className="text-theme-secondary">Checking permissions...</p>
            </div>
          </div>
        );
      }

      return (
        <div className="flex min-h-screen bg-theme-primary text-theme-primary font-sans theme-transition">
          {/* Mobile Sidebar Overlay */}
          {sidebarOpen && (
            <div 
              className="fixed inset-0 z-40 bg-black bg-opacity-50 transition-opacity lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          {/* Sidebar */}
          <aside className={`
            fixed lg:static inset-y-0 left-0 z-50 w-72 bg-theme-secondary 
            transform transition-transform duration-300 ease-in-out lg:translate-x-0
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            flex flex-col shadow-2xl border-r border-theme
          `}>
            {/* Sidebar Header */}
            <div className="flex items-center justify-between h-16 px-6 border-b border-theme">
              <Link href="/admin/dashboard" className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
                  <ChartBarIcon className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-theme-primary">Admin Panel</span>
              </Link>
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden p-2 rounded-lg hover:bg-theme-tertiary transition-colors"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-6 space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = router.pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`
                      flex items-center px-4 py-3 rounded-xl transition-all duration-200
                      ${isActive 
                        ? 'bg-accent text-white shadow-lg transform scale-105' 
                        : 'text-theme-secondary hover:bg-theme-tertiary hover:text-theme-primary hover:transform hover:scale-105'
                      }
                    `}
                  >
                    <Icon className="w-5 h-5 mr-3" />
                    <span className="font-medium">{item.name}</span>
                    {isActive && (
                      <div className="ml-auto w-2 h-2 bg-white rounded-full" />
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* User Section */}
            <div className="p-4 border-t border-theme">
              <div className="flex items-center space-x-3 p-3 rounded-xl bg-theme-tertiary mb-3">
                <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold">
                    {user?.email?.charAt(0).toUpperCase() || 'A'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-theme-primary truncate">
                    {user?.email || 'Admin'}
                  </p>
                  <p className="text-xs text-theme-secondary">Administrator</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center w-full px-4 py-3 rounded-xl text-error-color hover:bg-error-color hover:text-white transition-all duration-200 group"
              >
                <LogoutIcon />
                <span className="font-medium">Logout</span>
              </button>
            </div>
          </aside>

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col lg:ml-0">
            {/* Top Header */}
            <header className="bg-theme-primary shadow-sm border-b border-theme sticky top-0 z-30">
              <div className="flex items-center justify-between h-16 px-4 lg:px-6">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => setSidebarOpen(true)}
                    className="lg:hidden p-2 rounded-lg hover:bg-theme-secondary transition-colors"
                  >
                    <Bars3Icon className="w-5 h-5" />
                  </button>
                  <div>
                    <h1 className="text-xl font-semibold text-theme-primary">
                      Welcome, Admin
                    </h1>
                    <p className="text-sm text-theme-secondary">
                      {new Date().toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  {/* Notifications Dropdown */}
                  <div className="relative dropdown-container">
                    <button 
                      onClick={() => setShowNotifications(!showNotifications)}
                      className="relative p-2 rounded-lg hover:bg-theme-secondary transition-colors"
                    >
                      <BellIcon className="w-5 h-5 text-theme-secondary" />
                      {notifications > 0 && (
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-accent text-white text-xs rounded-full flex items-center justify-center">
                          {notifications}
                        </span>
                      )}
                    </button>
                    
                    {/* Notifications Dropdown */}
                    {showNotifications && (
                      <div className="absolute right-0 mt-2 w-80 bg-theme-primary border border-theme rounded-xl shadow-lg z-50 admin-fade-in">
                        <div className="p-4 border-b border-theme">
                          <h3 className="text-lg font-semibold text-theme-primary">Notifications</h3>
                        </div>
                        <div className="max-h-96 overflow-y-auto">
                          <div className="p-4 border-b border-theme hover:bg-theme-secondary transition-colors">
                            <div className="flex items-start space-x-3">
                              <div className="w-2 h-2 bg-accent rounded-full mt-2 flex-shrink-0"></div>
                              <div>
                                <p className="text-sm font-medium text-theme-primary">New order received</p>
                                <p className="text-xs text-theme-secondary">Order #1234 from John Doe</p>
                                <p className="text-xs text-theme-tertiary">2 minutes ago</p>
                              </div>
                            </div>
                          </div>
                          <div className="p-4 border-b border-theme hover:bg-theme-secondary transition-colors">
                            <div className="flex items-start space-x-3">
                              <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                              <div>
                                <p className="text-sm font-medium text-theme-primary">Low stock alert</p>
                                <p className="text-xs text-theme-secondary">Product &quot;T-Shirt&quot; has only 5 items left</p>
                                <p className="text-xs text-theme-tertiary">1 hour ago</p>
                              </div>
                            </div>
                          </div>
                          <div className="p-4 hover:bg-theme-secondary transition-colors">
                            <div className="flex items-start space-x-3">
                              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                              <div>
                                <p className="text-sm font-medium text-theme-primary">New user registered</p>
                                <p className="text-xs text-theme-secondary">jane.doe@example.com joined</p>
                                <p className="text-xs text-theme-tertiary">3 hours ago</p>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="p-4 border-t border-theme">
                          <button 
                            onClick={() => {
                              setShowNotifications(false);
                              // Navigate to notifications page or show notifications modal
                              console.log('View all notifications clicked');
                            }}
                            className="w-full text-center text-sm text-accent hover:text-accent-dark transition-colors"
                          >
                            View all notifications
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Settings Dropdown */}
                  <div className="relative dropdown-container">
                    <button 
                      onClick={() => setShowSettings(!showSettings)}
                      className="p-2 rounded-lg hover:bg-theme-secondary transition-colors"
                    >
                      <Cog6ToothIcon className="w-5 h-5 text-theme-secondary" />
                    </button>
                    
                    {/* Settings Dropdown */}
                    {showSettings && (
                      <div className="absolute right-0 mt-2 w-64 bg-theme-primary border border-theme rounded-xl shadow-lg z-50 admin-fade-in">
                        <div className="p-4 border-b border-theme">
                          <h3 className="text-lg font-semibold text-theme-primary">Settings</h3>
                        </div>
                        <div className="p-2">
                          <button 
                            onClick={() => {
                              setShowSettings(false);
                              // Add profile settings logic here
                              console.log('Profile Settings clicked');
                            }}
                            className="w-full text-left p-3 rounded-lg hover:bg-theme-secondary transition-colors"
                          >
                            <div className="flex items-center space-x-3">
                              <UsersIcon className="w-4 h-4 text-theme-secondary" />
                              <span className="text-sm text-theme-primary">Profile Settings</span>
                            </div>
                          </button>
                          <button 
                            onClick={() => {
                              setShowSettings(false);
                              // Add system settings logic here
                              console.log('System Settings clicked');
                            }}
                            className="w-full text-left p-3 rounded-lg hover:bg-theme-secondary transition-colors"
                          >
                            <div className="flex items-center space-x-3">
                              <Cog6ToothIcon className="w-4 h-4 text-theme-secondary" />
                              <span className="text-sm text-theme-primary">System Settings</span>
                            </div>
                          </button>
                          <button 
                            onClick={() => {
                              setShowSettings(false);
                              setShowNotifications(true);
                            }}
                            className="w-full text-left p-3 rounded-lg hover:bg-theme-secondary transition-colors"
                          >
                            <div className="flex items-center space-x-3">
                              <BellIcon className="w-4 h-4 text-theme-secondary" />
                              <span className="text-sm text-theme-primary">Notification Settings</span>
                            </div>
                          </button>
                          <button 
                            onClick={() => {
                              setShowSettings(false);
                              // Toggle language or show language modal
                              console.log('Language & Region clicked');
                            }}
                            className="w-full text-left p-3 rounded-lg hover:bg-theme-secondary transition-colors"
                          >
                            <div className="flex items-center space-x-3">
                              <span className="w-4 h-4 text-theme-secondary">🌐</span>
                              <span className="text-sm text-theme-primary">Language & Region</span>
                            </div>
                          </button>
                        </div>
                        <div className="p-4 border-t border-theme">
                          <button 
                            onClick={() => {
                              setShowSettings(false);
                              router.push('/admin/settings');
                            }}
                            className="w-full text-center text-sm text-accent hover:text-accent-dark transition-colors"
                          >
                            Advanced Settings
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Theme Toggle */}
                  <DynamicThemeToggle size="normal" />
                </div>
              </div>
            </header>

            {/* Page Content */}
            <main className="flex-1 p-4 lg:p-6 overflow-auto bg-theme-primary">
              <div className="max-w-7xl mx-auto">
                {children}
              </div>
            </main>
          </div>
        </div>
      );
    };

    export default AdminLayout; // <-- Correct Default Export
    