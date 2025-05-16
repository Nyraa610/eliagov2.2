import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';

// Import translations
import enTranslation from './translations/en.json';
import frTranslation from './translations/fr.json';
import elTranslation from './translations/el.json';
import esTranslation from './translations/es.json';

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
  // Chargement des traductions à la demande
  .use(Backend)
  // Détection automatique de la langue du navigateur
  .use(LanguageDetector)
  // Intégration avec React
  .use(initReactI18next)
  .init({
    resources,
    // Utilise la langue stockée dans localStorage ou la langue du navigateur, avec l'anglais en fallback
    lng: localStorage.getItem('language') || navigator.language?.split('-')[0] || 'en',
    fallbackLng: 'en',
    // Active le débogage en développement
    debug: process.env.NODE_ENV === 'development',
    // Permet l'utilisation de clés imbriquées
    keySeparator: '.',
    // Ne pas échapper les valeurs HTML dans les traductions
    interpolation: {
      escapeValue: false
    },
    // Recharge les traductions lorsque la langue change
    react: {
      useSuspense: true,
      bindI18n: 'languageChanged loaded',
      bindI18nStore: 'added removed',
      nsMode: 'default'
    },
    // Détection de la langue
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'language',
      caches: ['localStorage']
    }
  });

// Fonction pour changer la langue
export const changeLanguage = (language) => {
  localStorage.setItem('language', language);
  i18n.changeLanguage(language);
  // Force le rechargement des composants qui utilisent les traductions
  document.documentElement.lang = language;
};

// Écouteur pour les changements de langue
i18n.on('languageChanged', (lng) => {
  document.documentElement.lang = lng;
  // Vous pouvez ajouter d'autres actions ici si nécessaire
});

export default i18n;
