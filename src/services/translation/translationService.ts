
import i18n from '@/i18n/i18n';
import { TranslationEntry, TranslationNamespace } from './types';
import { getAllKeysFromObject } from './utils';

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
