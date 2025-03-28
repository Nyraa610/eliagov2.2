
import { availableLanguages } from './types';
import { translationService } from './translationService';
import { getAllKeysFromObject } from './utils';

class MissingTranslationsService {
  // Get missing translations compared to the base language (usually English)
  async getMissingTranslations(baseLanguage: string = 'en'): Promise<{[language: string]: string[]}> {
    const baseTranslations = await translationService.getTranslations(baseLanguage);
    const allKeys = getAllKeysFromObject(baseTranslations);
    
    const result: {[language: string]: string[]} = {};
    
    for (const lang of availableLanguages) {
      if (lang.code !== baseLanguage && lang.enabled) {
        const langTranslations = await translationService.getTranslations(lang.code);
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
}

export const missingTranslationsService = new MissingTranslationsService();
