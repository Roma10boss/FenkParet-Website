import React from 'react';

/**
 * A reusable, theme-aware button component.
 *
 * @param {object} props - The component props.
 * @param {'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'} [props.variant='primary'] - The visual style of the button.
 * @param {'sm' | 'md' | 'lg'} [props.size='md'] - The size of the button.
 * @param {boolean} [props.disabled=false] - Whether the button is disabled.
 * @param {string} [props.className=''] - Additional CSS classes for custom styling.
 * @param {React.ElementType} [props.icon] - An optional Heroicons component for the icon.
 * @param {'left' | 'right'} [props.iconPosition='left'] - Position of the icon relative to the text.
 * @param {React.ReactNode} props.children - The content of the button (text, etc.).
 * @param {function} [props.onClick] - Click handler for the button.
 * @param {string} [props.type='button'] - The type attribute for the button element.
 * @returns {JSX.Element} The rendered button component.
 */
const Button = ({
  variant = 'primary',
  size = 'md',
  disabled = false,
  className = '',
  icon: Icon, // Destructure and rename 'icon' to 'Icon' for JSX rendering
  iconPosition = 'left',
  children,
  onClick,
  type = 'button', // Default to 'button' to prevent unintended form submissions
  ...rest // Capture any other props like 'aria-label', 'data-cy', etc.
}) => {
  // Base classes for all buttons
  let baseClasses = 'inline-flex items-center justify-center font-medium rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-theme-background';

  // Size classes
  switch (size) {
    case 'sm':
      baseClasses += ' px-3 py-1.5 text-sm';
      break;
    case 'lg':
      baseClasses += ' px-6 py-3 text-lg';
      break;
    case 'md':
    default:
      baseClasses += ' px-4 py-2 text-base';
      break;
  }

  // Variant classes (using your theme variables)
  switch (variant) {
    case 'secondary':
      baseClasses += ' bg-theme-secondary text-theme-primary border border-theme hover:bg-theme-tertiary focus:ring-theme-secondary-ring';
      break;
    case 'outline':
      baseClasses += ' bg-transparent border-2 border-accent text-accent hover:bg-accent-light hover:text-accent-hover focus:ring-accent-ring';
      break;
    case 'ghost':
      baseClasses += ' bg-transparent text-theme-primary hover:bg-theme-tertiary focus:ring-theme-tertiary-ring';
      break;
    case 'danger':
      baseClasses += ' bg-error-color text-error-contrast hover:bg-error-dark focus:ring-error-color';
      break;
    case 'primary':
    default:
      baseClasses += ' bg-accent text-accent-contrast shadow-md hover:bg-accent-dark focus:ring-accent';
      break;
  }

  // Disabled state classes
  if (disabled) {
    baseClasses += ' opacity-50 cursor-not-allowed';
  }

  // Combine custom className last to allow overrides
  const finalClasses = `${baseClasses} ${className}`;

  // Render icon if provided
  const renderIcon = Icon ? <Icon className={`h-5 w-5 ${children ? (iconPosition === 'left' ? 'mr-2' : 'ml-2') : ''}`} /> : null;

  return (
    <button
      type={type}
      className={finalClasses}
      onClick={onClick}
      disabled={disabled}
      {...rest} // Spread any additional props
    >
      {iconPosition === 'left' && renderIcon}
      {children}
      {iconPosition === 'right' && renderIcon}
    </button>
  );
};

export default Button;
