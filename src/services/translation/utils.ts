
/**
 * Helper functions for translation service
 */

/**
 * Get all keys from a nested object with dot notation
 */
export function getAllKeysFromObject(obj: object, prefix: string = ''): string[] {
  let keys: string[] = [];
  
  for (const [key, value] of Object.entries(obj)) {
    const newKey = prefix ? `${prefix}.${key}` : key;
    
    if (typeof value === 'object' && value !== null) {
      keys = [...keys, ...getAllKeysFromObject(value, newKey)];
    } else {
      keys.push(newKey);
    }
  }
  
  return keys;
}

/**
 * Flatten nested translations into dot notation
 */
export function flattenTranslations(obj: any, prefix: string = ''): {[key: string]: string} {
  let result: {[key: string]: string} = {};
  
  for (const [key, value] of Object.entries(obj)) {
    const newKey = prefix ? `${prefix}.${key}` : key;
    
    if (typeof value === 'object' && value !== null) {
      result = { ...result, ...flattenTranslations(value, newKey) };
    } else {
      result[newKey] = value as string;
    }
  }
  
  return result;
}
