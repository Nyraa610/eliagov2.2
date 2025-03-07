
import { useTranslation } from 'react-i18next';
import { useLanguage } from '@/contexts/LanguageContext';

export type SupportedLanguage = 'en' | 'fr' | 'el' | 'es';

export function useLanguageSelector() {
  const { t } = useTranslation();
  const { language, changeLanguage } = useLanguage();

  const handleLanguageChange = (value: string) => {
    changeLanguage(value as SupportedLanguage);
  };

  const languageOptions = [
    { value: 'en', label: t('common.english') },
    { value: 'fr', label: t('common.french') },
    { value: 'el', label: t('common.greek') },
    { value: 'es', label: t('common.spanish') }
  ];

  return {
    currentLanguage: language,
    handleLanguageChange,
    languageOptions,
    t
  };
}
