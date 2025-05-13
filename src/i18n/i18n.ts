import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translations
import enTranslation from './translations/en.json';
import frTranslation from './translations/fr.json';
import elTranslation from './translations/el.json';
import esTranslation from './translations/es.json';

declare module 'i18next' {
  interface CustomTypeOptions {
    returnNull: false;
  }
}

const resources = {
  en: {
    translation: enTranslation
  },
  fr: {
    translation: frTranslation
  },
  el: {
    translation: elTranslation
  },
  es: {
    translation: esTranslation
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    lng: localStorage.getItem('language') || 'en',
    fallbackLng: 'en',
    supportedLngs: ['en', 'fr', 'el', 'es'],
    
    interpolation: {
      escapeValue: false
    },

    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'language',
    },

    react: {
      useSuspense: false
    },

    returnNull: false,

    // Paramètres de debug (à désactiver en production)
    debug: process.env.NODE_ENV === 'development',
    
    // Paramètres de pluralisation
    pluralSeparator: '_',
    contextSeparator: '_',

    // Paramètres de mise en cache
    load: 'currentOnly',
    
    // Paramètres de fallback
    partialBundledLanguages: true,
    
    // Paramètres d'interpolation
    interpolation: {
      escapeValue: false,
      format: (value, format) => {
        if (format === 'uppercase') return value.toUpperCase();
        if (format === 'lowercase') return value.toLowerCase();
        return value;
      },
    },
  });

// Fonction helper pour changer la langue
export const changeLanguage = (language: string) => {
  i18n.changeLanguage(language);
  localStorage.setItem('language', language);
};

// Fonction helper pour obtenir la langue actuelle
export const getCurrentLanguage = () => {
  return i18n.language || 'en';
};

// Fonction helper pour vérifier si une langue est supportée
export const isLanguageSupported = (language: string) => {
  return i18n.options.supportedLngs?.includes(language) || false;
};

export default i18n;
