// tailwind.config.js
/** @type {impor'tailwindcss'.Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class', // Correctly set for class-based dark mode
  theme: {
    extend: {
      colors: {
        // IMPORTANT: Map these to the variables set in ThemeContext.js and used in globals.css
        // Your accent colors are defined with --accent-primary, --accent-hover, --accent-dark, --accent-light, --accent-contrast
        // We'll use these to define Tailwind's 'primary' and 'accent' groups.
        
        // Tailwind's 'primary' group, mapping to your accent colors
        // This allows you to use `bg-primary-500` or `text-primary-600` for your accent green.
        primary: { 
          // You might not have direct 50-900 shades for your accent in ThemeContext.js,
          // so we map them to the closest accent variables you do have.
          // Adjust these mappings if your ThemeContext.js sets more granular accent shades.
          50: 'var(--accent-light)', // E.g., for very light green elements
          100: 'var(--accent-light)',
          200: 'var(--accent-light)',
          300: 'var(--accent-primary)', // Main accent color
          400: 'var(--accent-primary)',
          500: 'var(--accent-primary)',
          600: 'var(--accent-hover)',
          700: 'var(--accent-dark)',
          800: 'var(--accent-dark)',
          900: 'var(--accent-dark)',
        },
        
        // Tailwind's 'gray' group, mapping to your bg/text/border variables as appropriate
        // This allows you to use `bg-gray-100` or `text-gray-700` and have them theme-aware.
        gray: {
          50: 'var(--bg-secondary)', // Mapping to your bg-secondary (lighter bg in light, slightly lighter dark in dark)
          100: 'var(--bg-tertiary)', // Mapping to your bg-tertiary (subtle bg in light, card bg in dark)
          200: 'var(--border-color)', // Mapping to your border color for general light grey
          300: 'var(--text-tertiary)', // Mapping to your text-tertiary for muted grey
          400: 'var(--text-secondary)', // Mapping to your text-secondary for medium grey
          500: 'var(--text-secondary)', // Could also map here for consistency
          600: 'var(--text-secondary)',
          700: 'var(--text-primary)', // Mapping to text-primary (dark text in light, white text in dark)
          800: 'var(--text-primary)',
          900: 'var(--text-primary)',
        },

        // New: Directly map your semantic variable names if you use them often as Tailwind classes
        // This means you can use `bg-success-color` or `text-error-color`.
        'success-color': 'var(--success-color)',
        'success-light': 'var(--success-light)',
        'error-color': 'var(--error-color)',
        'error-light': 'var(--error-light)',
        'warning-color': 'var(--warning-color)',
        'warning-light': 'var(--warning-light)',
        'info-color': 'var(--info-color)',
        'info-light': 'var(--info-light)',

        // Map your direct BG and TEXT colors for common usage if you prefer
        // This lets you do `bg-theme-bg-primary` or `text-theme-text-primary` if you want.
        // However, your `@layer components` handles this well.
        // Leaving this out as your component classes already abstract this.
      },
      fontFamily: {
        // Ensure Poppins is included here if you want to use `font-poppins` class
        sans: ['Poppins', 'Inter', 'system-ui', 'sans-serif'],
        display: ['Poppins', 'Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        xs: ['0.75rem', { lineHeight: '1rem' }],
        sm: ['0.875rem', { lineHeight: '1.25rem' }],
        base: ['1rem', { lineHeight: '1.5rem' }],
        lg: ['1.125rem', { lineHeight: '1.75rem' }],
        xl: ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1' }],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      maxWidth: {
        '8xl': '88rem',
        '9xl': '96rem',
      },
      animation: {
        // Your custom animations are fine
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'bounce-gentle': 'bounceGentle 0.6s ease-out',
        'pulse-gentle': 'pulseGentle 2s ease-in-out infinite',
        'fade-in-up': 'fadeInUp 0.6s ease-out forwards', // Ensure this matches keyframes
        'blob': 'blob 7s infinite cubic-bezier(0.6, 0.2, 0.4, 0.8)',
      },
      keyframes: {
        // Your custom keyframes are fine
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: { '0%': { transform: 'translateY(20px)', opacity: '0' }, '100%': { transform: 'translateY(0)', opacity: '1' } },
        slideDown: { '0%': { transform: 'translateY(-20px)', opacity: '0' }, '100%': { transform: 'translateY(0)', opacity: '1' } },
        scaleIn: { '0%': { transform: 'scale(0.95)', opacity: '0' }, '100%': { transform: 'scale(1)', opacity: '1' } },
        bounceGentle: { '0%, 100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-5px)' } },
        pulseGentle: { '0%, 100%': { opacity: '1' }, '50%': { opacity: '0.8' } },
        fadeInUp: { '0%': { opacity: '0', transform: 'translateY(20px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } }, // Match animation name
        blob: { '0%': { transform: 'translate(0px, 0px) scale(1)' }, '33%': { transform: 'translate(30px, -50px) scale(1.1)' }, '66%': { transform: 'translate(-20px, 20px) scale(0.9)' }, '100%': { transform: 'translate(0px, 0px) scale(1)' } },
      },
      animationDelay: {
        '0': '0s', '100': '0.1s', '200': '0.2s', '300': '0.3s', '400': '0.4s', '500': '0.5s', '600': '0.6s', '700': '0.7s', '800': '0.8s', '900': '0.9s', '1000': '1s',
        '2000': '2s',
        '4000': '4s',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
        'medium': '0 4px 25px -5px rgba(0, 0, 0, 0.1), 0 20px 40px -5px rgba(0, 0, 0, 0.09)',
        'hard': '0 10px 40px -10px rgba(0, 0, 0, 0.15), 0 20px 50px -10px rgba(0, 0, 0, 0.1)',
      },
      borderRadius: {
        'xl': '1rem', '2xl': '1.5rem', '3xl': '2rem',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms')({ strategy: 'class' }),
    require('@tailwindcss/typography'),
    require('@tailwindcss/aspect-ratio'),
    function({ addUtilities, addComponents, theme }) {
      const newUtilities = {
        '.text-balance': { 'text-wrap': 'balance' },
        '.scrollbar-hide': {
          '-ms-overflow-style': 'none', 'scrollbar-width': 'none',
          '&::-webkit-scrollbar': { display: 'none' },
        },
        '.glass': {
          'background': 'rgba(255, 255, 255, 0.1)', 'backdrop-filter': 'blur(10px)',
          'border': '1px solid rgba(255, 255, 255, 0.2)',
        },
        '.glass-dark': {
          'background': 'rgba(0, 0, 0, 0.1)', 'backdrop-filter': 'blur(10px)',
          'border': '1px solid rgba(255, 255, 255, 0.1)',
        },
      };

      const newComponents = {
        // Removed generic .btn base, as your Button.js component handles this better.
        // Removed specific .btn-primary, .btn-secondary, .btn-outline definitions
        // as your custom @layer components in globals.css already define these.
        // The `components/ui/Button.js` expects these to be applied via globals.css.
        // Tailwind's `theme()` function used inside these components will correctly
        // resolve to the values defined in the `colors` extend section above.
        
        // Example if you *were* to keep them here and use direct theme() calls:
        // '.btn-primary': {
        //   'background-color': theme('colors.primary.500'), // This would use the mapped primary-500
        //   'color': theme('colors.white'), // Or var(--accent-contrast)
        //   '&:hover': { 'background-color': theme('colors.primary.600') },
        //   '.dark &': { /* ... */ },
        // },

        '.card': {
          'background-color': 'var(--bg-primary)', // Direct use of your CSS variable
          'border-radius': theme('borderRadius.xl'), // Using theme function for border-radius
          'box-shadow': 'var(--shadow-color)', // Direct use of your CSS variable
          'padding': theme('spacing.6'),
          // The dark mode override for card is handled in globals.css at the component layer using .dark &
        },
        '.product-grid': {
            '@apply grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8': {},
        },
        '.product-card': {
            '@apply flex flex-col border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden relative': {},
        },
      };

      addUtilities(newUtilities);
      addComponents(newComponents);
    },
  ],
};