
import i18n from '@/i18n/i18n';
import { availableLanguages } from './types';
import { translationService } from './translationService';

class ExportImportService {
  // Export all translations to JSON format
  async exportTranslations(): Promise<{[language: string]: object}> {
    try {
      const result = {};
      for (const lang of availableLanguages) {
        if (lang.enabled) {
          result[lang.code] = await translationService.getTranslations(lang.code);
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
}

export const exportImportService = new ExportImportService();
