// components/admin/withAdminAuth.js
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../hooks/useAuth';

const withAdminAuth = (WrappedComponent) => {
  const AdminProtectedComponent = (props) => {
    const router = useRouter();
    const { user, isAuthenticated, isAdmin, loading } = useAuth();

    useEffect(() => {
      if (!loading) {
        if (!isAuthenticated) {
          console.log('🔒 Admin route accessed without authentication, redirecting to login');
          router.push('/admin/login');
          return;
        }

        if (!isAdmin) {
          console.log('🚫 Non-admin user tried to access admin route, redirecting to home');
          router.push('/');
          return;
        }

        console.log('✅ Admin access granted for admin route');
      }
    }, [loading, isAuthenticated, isAdmin, router]);

    // Show loading while checking auth
    if (loading) {
      return (
        <div className="min-h-screen bg-theme-primary flex items-center justify-center">
          <div className="text-center">
            <div className="spinner w-12 h-12 mx-auto mb-4"></div>
            <p className="text-theme-secondary">Loading...</p>
          </div>
        </div>
      );
    }

    // Don't render if not authenticated or not admin
    if (!isAuthenticated || !isAdmin) {
      return (
        <div className="min-h-screen bg-theme-primary flex items-center justify-center">
          <div className="text-center">
            <div className="spinner w-12 h-12 mx-auto mb-4"></div>
            <p className="text-theme-secondary">Redirecting...</p>
          </div>
        </div>
      );
    }

    // Render the protected component
    return <WrappedComponent {...props} />;
  };

  // Set display name for debugging
  AdminProtectedComponent.displayName = `withAdminAuth(${WrappedComponent.displayName || WrappedComponent.name})`;

  return AdminProtectedComponent;
};

export default withAdminAuth;