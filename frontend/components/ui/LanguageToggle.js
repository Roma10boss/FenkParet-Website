// components/ui/LanguageToggle.js
import { LoadingSpinner } from './LoadingSpinner';
import { useTranslation } from '../../context/TranslationContext';

const LanguageToggle = ({ className = '' }) => {
  const { language, changeLanguage, isLoading } = useTranslation();

  const handleLanguageToggle = async () => {
    const newLanguage = language === 'fr' ? 'en' : 'fr';
    await changeLanguage(newLanguage);
  };

  return (
    <button
      onClick={handleLanguageToggle}
      disabled={isLoading}
      className={`
        px-3 py-2 rounded-lg font-medium theme-transition
        bg-theme-secondary hover:bg-accent-light
        border border-theme hover:border-accent
        text-theme-secondary hover:text-accent
        focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed
        min-w-[3rem] flex items-center justify-center
        ${className}
      `}
      title={`Switch to ${language === 'fr' ? 'English' : 'Français'}`}
    >
      {isLoading ? (
        <LoadingSpinner size="small" />
      ) : (
        <span className="text-sm font-bold">
          {language === 'fr' ? 'EN' : 'FR'}
        </span>
      )}
    </button>
  );
};

export default LanguageToggle;