// components/ui/LoadingSpinner.js
import React from 'react';

export const LoadingSpinner = ({ size = 'normal', className = '' }) => {
  const sizeClasses = {
    small: 'w-4 h-4 border-2',
    normal: 'w-6 h-6 border-2', 
    large: 'w-8 h-8 border-4',
    xl: 'w-12 h-12 border-4'
  };

  return (
    <div 
      className={`spinner inline-block border-current border-r-transparent rounded-full animate-spin ${sizeClasses[size]} ${className}`}
      role="status"
      aria-label="Chargement"
    >
      <span className="sr-only">Chargement...</span>
    </div>
  );
};

export default LoadingSpinner;