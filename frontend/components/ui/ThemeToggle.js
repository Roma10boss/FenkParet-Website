// components/ui/ThemeToggle.js
'use client';
import { useState } from 'react';
import { useTheme } from '../../context/ThemeContext'; // Assuming named export
import { SunIcon, MoonIcon, ComputerDesktopIcon } from '@heroicons/react/24/outline'; // ComputerDesktopIcon needed for 'system' theme
import { LoadingSpinner } from './LoadingSpinner'; // Assuming named export from LoadingSpinner.js

const ThemeToggle = ({ className = '', size = 'normal', showLabel = false }) => {
  const { theme, toggleTheme, isDark, mounted } = useTheme(); // Now isDark is directly from context
  const [isToggling, setIsToggling] = useState(false);

  // Render placeholder during SSR/hydration to avoid layout shifts
  if (!mounted) {
    return <div className={`${size === 'small' ? 'w-8 h-8' : 'w-10 h-10'} ${className} bg-theme-secondary animate-pulse rounded-lg`} />;
  }

  const handleToggle = async () => {
    setIsToggling(true);
    toggleTheme(); // Calls the toggleTheme function from context

    setTimeout(() => {
      setIsToggling(false);
    }, 300);
  };

  const sizeClasses = {
    small: 'w-8 h-8 p-1.5',
    normal: 'w-10 h-10 p-2',
    large: 'w-12 h-12 p-2.5'
  };

  const iconSizes = {
    small: 'w-4 h-4',
    normal: 'w-5 h-5',
    large: 'w-6 h-6'
  };

  return (
    <div className="relative flex items-center">
      <button
        onClick={handleToggle}
        disabled={isToggling}
        className={`
          ${sizeClasses[size]}
          rounded-lg theme-transition relative overflow-hidden
          bg-theme-secondary hover:bg-accent-light
          border border-theme hover:border-accent
          text-theme-secondary hover:text-accent
          focus:outline-none focus:ring-2 focus:ring-accent-primary focus:ring-offset-2 focus:ring-offset-bg-primary
          disabled:opacity-50 disabled:cursor-not-allowed
          group
          ${className}
        `}
        aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
        title={`Current: ${theme} mode. Click to toggle.`}
      >
        <div className="absolute inset-0 accent-gradient opacity-0 group-hover:opacity-10 theme-transition" />
        <div className={`relative z-10 transition-transform duration-300 ${isToggling ? 'scale-75 rotate-180' : 'scale-100'}`}>
          {isDark ? ( // Use the isDark from context for the icon
            <SunIcon className={`${iconSizes[size]} transition-transform duration-300`} />
          ) : (
            <MoonIcon className={`${iconSizes[size]} transition-transform duration-300`} />
          )}
        </div>
        {isToggling && (
          <div className="absolute inset-0 flex items-center justify-center">
            <LoadingSpinner size="small" className="w-3 h-3" />
          </div>
        )}
      </button>
      {showLabel && (
        <span className="ml-3 text-sm text-theme-secondary font-medium capitalize">
          {theme} mode
        </span>
      )}
    </div>
  );
};

// Advanced Theme Selector with Dropdown (Keep this if you use it, or remove)
export const ThemeSelector = ({ className = '' }) => {
  const { theme, setLightTheme, setDarkTheme, setSystemTheme, mounted } = useTheme(); // Added setSystemTheme
  const [showDropdown, setShowDropdown] = useState(false);

  if (!mounted) {
    return <div className={`w-32 h-10 ${className} bg-theme-secondary animate-pulse rounded-lg`} />;
  }

  const themes = [
    {
      key: 'light',
      label: 'Light',
      icon: SunIcon,
      action: setLightTheme,
      description: 'Clean and bright'
    },
    {
      key: 'dark',
      label: 'Dark',
      icon: MoonIcon,
      action: setDarkTheme,
      description: 'Easy on the eyes'
    },
    {
      key: 'system',
      label: 'System',
      icon: ComputerDesktopIcon, // Using ComputerDesktopIcon for system theme
      action: setSystemTheme,
      description: 'Matches OS preference'
    },
  ];

  const currentTheme = themes.find(t => t.key === theme);

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="
          flex items-center space-x-3 px-4 py-2.5 rounded-lg
          bg-theme-secondary hover:bg-accent-light
          border border-theme hover:border-accent
          text-theme-primary
          theme-transition min-w-[140px]
          focus:outline-none focus:ring-2 focus:ring-accent-primary focus:ring-offset-2
        "
        aria-haspopup="true"
        aria-expanded={showDropdown ? "true" : "false"}
      >
        {currentTheme.icon && <currentTheme.icon className="w-5 h-5 text-accent" />}
        <span className="text-sm font-medium">{currentTheme.label}</span>
        <svg
          className={`w-4 h-4 ml-auto transition-transform duration-200 ${showDropdown ? 'rotate-180' : ''}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {showDropdown && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowDropdown(false)}
          />

          <div className="
            absolute right-0 mt-2 w-56 rounded-xl shadow-lg z-50
            bg-theme-primary border border-theme
            animate-fade-in-scale
          ">
            <div className="py-2">
              {themes.map((themeOption) => (
                <button
                  key={themeOption.key}
                  onClick={() => {
                    themeOption.action();
                    setShowDropdown(false);
                  }}
                  className={`
                    flex items-center space-x-3 w-full px-4 py-3 text-left
                    hover:bg-accent-light transition-colors duration-200
                    first:rounded-t-xl last:rounded-b-xl
                    ${theme === themeOption.key ? 'bg-accent text-accent-contrast' : 'text-theme-primary'}
                  `}
                  aria-pressed={theme === themeOption.key ? "true" : "false"}
                >
                  <themeOption.icon className="w-5 h-5" />
                  <div className="flex-1">
                    <div className="font-medium">{themeOption.label}</div>
                    <div className={`text-xs ${theme === themeOption.key ? 'text-accent-contrast opacity-80' : 'text-theme-tertiary'}`}>
                      {themeOption.description}
                    </div>
                  </div>
                  {theme === themeOption.key && (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ThemeToggle;
