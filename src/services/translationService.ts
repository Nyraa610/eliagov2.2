
import i18n from '@/i18n/i18n';
import { supabaseService } from './base/supabaseService';

// Type definitions
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

class TranslationService {
  // Get all translations for a specific language
  async getTranslations(languageCode: string): Promise<object> {
    try {
      // In a real implementation, this would fetch from a database
      // For now, we'll use the static files loaded by i18n
      return i18n.getResourceBundle(languageCode, 'translation');
    } catch (error) {
      console.error('Error fetching translations:', error);
      return {};
    }
  }

  // Get translations for a specific namespace and language
  async getNamespaceTranslations(namespace: string, languageCode: string): Promise<object> {
    try {
      const allTranslations = await this.getTranslations(languageCode);
      return allTranslations[namespace] || {};
    } catch (error) {
      console.error(`Error fetching translations for namespace ${namespace}:`, error);
      return {};
    }
  }

  // Update a translation value
  async updateTranslation(entry: TranslationEntry): Promise<boolean> {
    try {
      // In a real implementation, this would update the database
      // and reload the translations
      console.log('Translation updated:', entry);
      
      // Mock implementation - in a real app you would store this in the database
      // For demonstration purposes only
      const currentTranslations = i18n.getResourceBundle(entry.languageCode, 'translation');
      const keyParts = entry.key.split('.');
      
      let current = currentTranslations;
      for (let i = 0; i < keyParts.length - 1; i++) {
        if (!current[keyParts[i]]) {
          current[keyParts[i]] = {};
        }
        current = current[keyParts[i]];
      }
      
      current[keyParts[keyParts.length - 1]] = entry.value;
      
      // Update the resource bundle
      i18n.addResourceBundle(entry.languageCode, 'translation', currentTranslations, true, true);
      
      return true;
    } catch (error) {
      console.error('Error updating translation:', error);
      return false;
    }
  }

  // Export all translations to JSON format
  async exportTranslations(): Promise<{[language: string]: object}> {
    try {
      const result = {};
      for (const lang of availableLanguages) {
        if (lang.enabled) {
          result[lang.code] = await this.getTranslations(lang.code);
        }
      }
      return result;
    } catch (error) {
      console.error('Error exporting translations:', error);
      return {};
    }
  }

  // Import translations from JSON format
  async importTranslations(translations: {[language: string]: object}): Promise<boolean> {
    try {
      for (const [langCode, content] of Object.entries(translations)) {
        i18n.addResourceBundle(langCode, 'translation', content, true, true);
      }
      return true;
    } catch (error) {
      console.error('Error importing translations:', error);
      return false;
    }
  }

  // Get missing translations compared to the base language (usually English)
  async getMissingTranslations(baseLanguage: string = 'en'): Promise<{[language: string]: string[]}> {
    const baseTranslations = await this.getTranslations(baseLanguage);
    const allKeys = this.getAllKeysFromObject(baseTranslations);
    
    const result: {[language: string]: string[]} = {};
    
    for (const lang of availableLanguages) {
      if (lang.code !== baseLanguage && lang.enabled) {
        const langTranslations = await this.getTranslations(lang.code);
        const missingKeys = [];
        
        for (const key of allKeys) {
          const keyParts = key.split('.');
          let exists = true;
          let current = langTranslations;
          
          for (const part of keyParts) {
            if (!current || !current[part]) {
              exists = false;
              break;
            }
            current = current[part];
          }
          
          if (!exists) {
            missingKeys.push(key);
          }
        }
        
        result[lang.code] = missingKeys;
      }
    }
    
    return result;
  }

  // Helper function to get all keys from a nested object
  private getAllKeysFromObject(obj: object, prefix: string = ''): string[] {
    let keys: string[] = [];
    
    for (const [key, value] of Object.entries(obj)) {
      const newKey = prefix ? `${prefix}.${key}` : key;
      
      if (typeof value === 'object' && value !== null) {
        keys = [...keys, ...this.getAllKeysFromObject(value, newKey)];
      } else {
        keys.push(newKey);
      }
    }
    
    return keys;
  }

  // Add a new translation key
  async addTranslationKey(namespace: string, key: string, translations: {[language: string]: string}): Promise<boolean> {
    try {
      for (const [langCode, value] of Object.entries(translations)) {
        const fullKey = `${namespace}.${key}`;
        await this.updateTranslation({
          key: fullKey,
          languageCode: langCode,
          value
        });
      }
      return true;
    } catch (error) {
      console.error('Error adding translation key:', error);
      return false;
    }
  }
}

export const translationService = new TranslationService();
