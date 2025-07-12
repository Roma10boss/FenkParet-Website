// pages/admin/login.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { useAuth } from '../../hooks/useAuth';
import { 
  EyeIcon, 
  EyeSlashIcon, 
  ShieldCheckIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import Card from '../../components/admin/Card';

export default function AdminLogin() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { login, isAuthenticated, isAdmin, loading, user } = useAuth();
  const router = useRouter();
  const { redirect } = router.query;

  // Redirect if already authenticated as admin
  useEffect(() => {
    if (isAuthenticated && !loading && user) {
      if (isAdmin || user.isAdmin || user.role === 'admin') {
        const redirectTo = redirect || '/admin/dashboard';
        router.push(redirectTo);
      } else {
        // Regular user tried to access admin - redirect to home
        router.push('/');
      }
    }
  }, [isAuthenticated, isAdmin, loading, user, router, redirect]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const { email, password } = formData;

    // Basic validation
    if (!email || !password) {
      setError('Please provide both email and password.');
      setIsSubmitting(false);
      return;
    }

    if (password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères.');
      setIsSubmitting(false);
      return;
    }

    if (!/[A-Z]/.test(password)) {
      setError('Le mot de passe doit contenir au moins une lettre majuscule.');
      setIsSubmitting(false);
      return;
    }

    try {
      const result = await login(email, password);
      
      if (result.success) {
        // Check if user is admin IMMEDIATELY after login
        if (result.user.isAdmin || result.user.role === 'admin') {
          // Admin user - redirect to admin dashboard
          const redirectTo = redirect || '/admin/dashboard';
          window.location.href = redirectTo; // Force full page redirect
        } else {
          // Not an admin - show error
          setError('Access denied. Admin privileges required.');
          // Don't logout, just show error
        }
      } else {
        setError(result.error || 'Invalid credentials. Please try again.');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error('Admin login error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Don't render if already authenticated and admin
  if (isAuthenticated && isAdmin && !loading) {
    return null; // Will redirect
  }

  return (
    <>
      <Head>
        <title>Admin Login | Fenkparet</title>
        <meta name="description" content="Admin login portal for Fenkparet" />
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-theme-secondary">
        {/* Header */}
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="flex justify-center">
            <div className="feature-icon-large bg-red-600 hover:glow-accent theme-transition">
              <ShieldCheckIcon className="w-10 h-10 text-white" />
            </div>
          </div>
          
          <h2 className="mt-6 text-center text-3xl font-bold text-theme-primary">
            Admin Access
          </h2>
          <p className="mt-2 text-center text-sm text-theme-secondary">
            Authorized personnel only
          </p>
        </div>

        {/* Warning Banner */}
        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <Card className="p-4 mb-6 border-l-4 border-accent">
            <div className="flex">
              <ExclamationTriangleIcon className="h-5 w-5 text-accent mt-0.5 mr-3" />
              <div>
                <p className="text-sm text-theme-primary">
                  <strong>Restricted Area:</strong> This is a secure admin portal. 
                  All access attempts are logged and monitored.
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Login Form */}
        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <Card className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Error Message */}
              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <div className="flex">
                    <ExclamationTriangleIcon className="h-5 w-5 text-red-500 mt-0.5 mr-3" />
                    <div>
                      <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                        Authentication Failed
                      </h3>
                      <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                        {error}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Email Field */}
              <div>
                <label htmlFor="email" className="form-label">
                  Admin Email Address
                </label>
                <div className="mt-1">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="Enter admin email"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="form-label">
                  Admin Password
                </label>
                <div className="mt-1 relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={formData.password}
                    onChange={handleInputChange}
                    className="form-input pr-10"
                    placeholder="Enter admin password"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <button
                      type="button"
                      className="text-theme-tertiary hover:text-theme-secondary theme-transition"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeSlashIcon className="h-5 w-5" />
                      ) : (
                        <EyeIcon className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-accent focus:ring-accent border-theme rounded"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-theme-secondary">
                    Keep me signed in
                  </label>
                </div>

                <div className="text-sm">
                  <Link
                    href="/admin/forgot-password"
                    className="font-medium text-accent hover:text-accent-dark theme-transition"
                  >
                    Forgot password?
                  </Link>
                </div>
              </div>

              {/* Submit Button */}
              <div>
                <button
                  type="submit"
                  disabled={isSubmitting || loading}
                  className="btn-primary w-full flex justify-center py-3"
                >
                  {isSubmitting || loading ? (
                    <div className="flex items-center">
                      <div className="spinner w-5 h-5 mr-2"></div>
                      Authenticating...
                    </div>
                  ) : (
                    <>
                      <ShieldCheckIcon className="h-5 w-5 mr-2" />
                      Admin Sign In
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Security Notice */}
            <Card className="p-4 mt-6 bg-theme-tertiary border border-theme">
              <div className="flex items-start">
                <ShieldCheckIcon className="h-5 w-5 text-theme-secondary mt-0.5 mr-2" />
                <div className="text-xs text-theme-secondary">
                  <p className="font-medium mb-1">Security Notice</p>
                  <ul className="space-y-1 list-disc list-inside">
                    <li>This portal uses encrypted connections (HTTPS)</li>
                    <li>All login attempts are logged and monitored</li>
                    <li>Unauthorized access is prohibited by law</li>
                    <li>Report security issues immediately</li>
                  </ul>
                </div>
              </div>
            </Card>

            {/* Back to Store */}
            <div className="mt-6 text-center">
              <Link
                href="/"
                className="text-sm text-theme-tertiary hover:text-theme-secondary theme-transition"
              >
                ← Back to Store
              </Link>
            </div>
          </Card>
        </div>

        {/* Demo Credentials */}
        {process.env.NODE_ENV === 'development' && (
          <Card className="mt-8 sm:mx-auto sm:w-full sm:max-w-md p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                    Development Mode - Demo Credentials
                  </h3>
                  <div className="mt-2 text-sm text-blue-700 dark:text-blue-300">
                    <p><strong>Email:</strong> admin@fenkparet.com</p>
                    <p><strong>Password:</strong> Admin123!</p>
                    <p className="text-xs mt-1 text-blue-600 dark:text-blue-400">
                      (Make sure your backend is running and admin user exists)
                    </p>
                  </div>
                </div>
              </div>
          </Card>
        )}

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-xs text-theme-tertiary">
            Fenkparet Admin Portal v2.0
            <br />
            Unauthorized access prohibited. All activities monitored.
          </p>
        </div>
      </div>
    </>
  );
}