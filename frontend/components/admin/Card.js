import React from 'react';

const Card = ({ 
  title, 
  children, 
  className = '', 
  headerAction,
  variant = 'default',
  animated = true 
}) => {
  const variantClasses = {
    default: 'admin-card',
    elevated: 'admin-card hover:shadow-2xl',
    outlined: 'border-2 border-theme rounded-xl p-6 bg-theme-primary',
    filled: 'bg-accent-light rounded-xl p-6'
  };

  const animationClass = animated ? 'admin-fade-in' : '';

  return (
    <div className={`${variantClasses[variant]} ${animationClass} ${className}`}>
      {title && (
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-theme-primary">{title}</h3>
          {headerAction && (
            <div className="flex items-center space-x-2">
              {headerAction}
            </div>
          )}
        </div>
      )}
      <div>{children}</div>
    </div>
  );
};

export default Card;
