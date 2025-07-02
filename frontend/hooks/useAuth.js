// hooks/useAuth.js
import { useState, useEffect, createContext, useContext } from 'react';
import { useRouter } from 'next/router';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      
      if (!storedToken) {
        setLoading(false);
        return;
      }

      setToken(storedToken);
      
      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          setUser(userData);
          console.log('🔐 User loaded from storage:', userData);
        } catch (e) {
          console.error('Error parsing stored user:', e);
          localStorage.removeItem('user');
        }
      }

      // Verify token with server
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://fenkparet-backend.onrender.com'}/api/auth/me`, {
        headers: {
          'Authorization': `Bearer ${storedToken}`,
          'Content-Type': 'application/json',
        },
        mode: 'cors',
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        localStorage.setItem('user', JSON.stringify(data.user));
        console.log('✅ User verified with server:', data.user);
      } else {
        // Token invalid, clear storage
        console.log('❌ Token invalid, clearing storage');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      console.log('🔄 Attempting login for:', email);
      
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://fenkparet-backend.onrender.com';
      console.log('🌐 API URL:', apiUrl);
      
      const response = await fetch(`${apiUrl}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'cors',
        body: JSON.stringify({ email, password }),
      });

      console.log('📡 Response status:', response.status, response.statusText);
      
      const data = await response.json();
      console.log('📡 Login response:', data);

      if (response.ok && data.success) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setToken(data.token);
        setUser(data.user);
        
        console.log('✅ Login successful:', data.user);
        console.log('🛡️  Is Admin?', data.user.isAdmin, data.user.role);
        
        return { success: true, user: data.user };
      } else {
        console.log('❌ Login failed:', response.status, data.message);
        if (response.status === 429) {
          return { success: false, error: 'Trop de tentatives. Veuillez patienter quelques minutes et réessayer.' };
        } else if (response.status >= 500) {
          return { success: false, error: 'Erreur du serveur. Le service est temporairement indisponible.' };
        } else {
          return { success: false, error: data.message || 'Identifiants incorrects.' };
        }
      }
    } catch (error) {
      console.error('❌ Login error:', error);
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        // Backend is unreachable - check for demo credentials
        if (email === 'demo@fenkparet.com' && password === 'demo123') {
          console.log('🎭 Using demo user (backend unavailable)');
          const demoUser = {
            _id: 'demo123',
            name: 'Utilisateur Démo',
            email: 'demo@fenkparet.com',
            isAdmin: false,
            role: 'customer'
          };
          localStorage.setItem('user', JSON.stringify(demoUser));
          localStorage.setItem('token', 'demo-token-123');
          setToken('demo-token-123');
          setUser(demoUser);
          return { success: true, user: demoUser };
        }
        return { success: false, error: 'Impossible de se connecter au serveur. Essayez avec demo@fenkparet.com / demo123 pour tester.' };
      }
      return { success: false, error: 'Erreur de connexion. Veuillez réessayer.' };
    }
  };

  const register = async (userData) => {
    try {
      console.log('🔄 Attempting registration for:', userData.email);
      console.log('📋 Registration data:', { ...userData, password: '[HIDDEN]' });
      
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://fenkparet-backend.onrender.com';
      console.log('🌐 API URL:', apiUrl);
      
      const response = await fetch(`${apiUrl}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'cors',
        body: JSON.stringify(userData),
      });

      console.log('📡 Response status:', response.status, response.statusText);
      
      const data = await response.json();
      console.log('📡 Register response:', data);

      if (response.ok && data.success) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setToken(data.token);
        setUser(data.user);
        console.log('✅ Registration successful:', data.user);
        return { success: true, user: data.user };
      } else {
        console.log('❌ Registration failed:', response.status, data.message);
        if (response.status === 429) {
          return { success: false, error: 'Trop de tentatives. Veuillez patienter quelques minutes et réessayer.' };
        } else if (response.status >= 500) {
          return { success: false, error: 'Erreur du serveur. Le service est temporairement indisponible.' };
        } else if (response.status === 400) {
          return { success: false, error: data.message || 'Données invalides. Vérifiez vos informations.' };
        } else {
          return { success: false, error: data.message || 'Échec de l\'inscription.' };
        }
      }
    } catch (error) {
      console.error('❌ Register error:', error);
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        return { success: false, error: 'Impossible de se connecter au serveur. Vérifiez votre connexion internet.' };
      }
      return { success: false, error: 'Erreur de connexion. Veuillez réessayer.' };
    }
  };

  const logout = () => {
    console.log('🚪 Logging out user');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    router.push('/');
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  // Check if user is authenticated
  const isAuthenticated = !!user && !!token;

  // Check if user is admin - IMPORTANT: This checks both isAdmin and role
  const isAdmin = user?.isAdmin === true || user?.role === 'admin';

  const value = {
    user,
    token,
    loading,
    isAuthenticated,
    isAdmin,
    login,
    register,
    logout,
    updateUser,
    checkAuth
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};