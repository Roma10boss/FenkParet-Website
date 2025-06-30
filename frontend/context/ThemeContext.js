// context/ThemeContext.js
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const ThemeContext = createContext(undefined);

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('light'); // 'light', 'dark', or 'system'
  const [mounted, setMounted] = useState(false); // Tracks if component mounted on client

  // Initialize theme from localStorage or system preference
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('fenkparet-theme');
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

      let initialTheme = 'light';
      if (savedTheme) {
        initialTheme = savedTheme;
      } else if (prefersDark) {
        initialTheme = 'dark';
      }

      setTheme(initialTheme);
      setMounted(true);
    }
  }, []);

  // Apply 'dark' class to document.documentElement and save preference
  useEffect(() => {
    if (mounted) {
      const root = document.documentElement;

      // Remove any existing theme classes
      root.classList.remove('light', 'dark');

      // Determine the effective theme to apply the class
      const isActuallyDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

      if (isActuallyDark) {
        root.classList.add('dark');
      } else {
        root.classList.add('light'); // Explicitly add 'light' class if not dark
      }

      localStorage.setItem('fenkparet-theme', theme);
    }
  }, [theme, mounted]);

  // Listen for system theme changes (if user has selected 'system' theme)
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => {
      // Only update if the user's explicit preference is 'system' or no preference is stored
      const storedTheme = localStorage.getItem('fenkparet-theme');
      if (!storedTheme || storedTheme === 'system') {
        setTheme(e.matches ? 'dark' : 'light');
      }
    };
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  }, []);
  const setLightTheme = useCallback(() => setTheme('light'), []);
  const setDarkTheme = useCallback(() => setTheme('dark'), []);
  const setSystemTheme = useCallback(() => setTheme('system'), []);

  // Determine if the current *applied* theme is dark for UI purposes (e.g., icon display)
  const isDarkApplied = mounted && document.documentElement.classList.contains('dark');


  const value = {
    theme, // The stored preference ('light', 'dark', 'system')
    toggleTheme,
    setLightTheme,
    setDarkTheme,
    setSystemTheme, // Expose system theme setter
    isDark: isDarkApplied, // Whether the HTML element actually has 'dark' class
    isLight: !isDarkApplied, // Whether the HTML element actually has 'light' class (or no dark)
    mounted // Whether the component has mounted on the client
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) { // Check for undefined as per createContext(undefined)
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
