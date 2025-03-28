
// Type definitions for translation service
export interface TranslationEntry {
  key: string;
  languageCode: string;
  value: string;
}

export interface TranslationNamespace {
  name: string;
  entries: { [key: string]: any };
}

export interface LanguageInfo {
  code: string;
  name: string;
  nativeName: string;
  enabled: boolean;
}

// Available languages in the system
export const availableLanguages: LanguageInfo[] = [
  { code: 'en', name: 'English', nativeName: 'English', enabled: true },
  { code: 'fr', name: 'French', nativeName: 'Français', enabled: true },
  { code: 'el', name: 'Greek', nativeName: 'Ελληνικά', enabled: true },
  { code: 'es', name: 'Spanish', nativeName: 'Español', enabled: true }
];

// Namespace categorization for the admin interface
export const translationNamespaces = [
  'common',
  'auth',
  'dashboard',
  'navigation',
  'profile',
  'assessment',
  'training',
  'company',
  'engagement',
  'valueChain',
  'news'
];
