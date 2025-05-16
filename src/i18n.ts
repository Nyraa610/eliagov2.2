
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Define translation resources
const resources = {
  en: {
    translation: {
      common: {
        loading: 'Loading...',
        cancel: 'Cancel',
      },
      auth: {
        emailLabel: 'Email address',
        passwordLabel: 'Password',
      },
      // Add other translation keys as needed
    },
  },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
