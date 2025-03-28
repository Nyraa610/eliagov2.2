
import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useToast } from '@/components/ui/use-toast';
import { 
  translationService,
  TranslationNamespace
} from '@/services/translationService';

export function useTranslationLoaders() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [namespaces, setNamespaces] = useState<TranslationNamespace[]>([]);
  const [translations, setTranslations] = useState<{[key: string]: string}>({});
  const [missingTranslations, setMissingTranslations] = useState<{[language: string]: string[]}>({});

  // Function to flatten nested translations
  const flattenTranslations = (obj: any, prefix: string = ''): {[key: string]: string} => {
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
  };

  // Load translations for a specific namespace and language
  const loadNamespaceTranslations = useCallback(async (namespace: string, language: string) => {
    setIsLoading(true);
    try {
      const data = await translationService.getNamespaceTranslations(namespace, language);
      setTranslations(flattenTranslations(data));
    } catch (error) {
      toast({
        title: t('common.error'),
        description: t('admin.translations.errorLoading'),
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  }, [t, toast]);

  // Load all available namespaces
  const loadNamespaces = useCallback(async () => {
    setIsLoading(true);
    try {
      // In a real implementation, this would fetch from the database
      // For now, we'll use the predefined list
      const namespacesData = await Promise.all(
        translationService.translationNamespaces.map(async name => {
          const entries = await translationService.getNamespaceTranslations(name, 'en');
          return { name, entries };
        })
      );
      
      setNamespaces(namespacesData);
    } catch (error) {
      toast({
        title: t('common.error'),
        description: t('admin.translations.errorLoadingNamespaces'),
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  }, [t, toast]);

  // Check for missing translations
  const checkMissingTranslations = useCallback(async () => {
    setIsLoading(true);
    try {
      const missing = await translationService.getMissingTranslations();
      setMissingTranslations(missing);
    } catch (error) {
      toast({
        title: t('common.error'),
        description: t('admin.translations.errorCheckingMissing'),
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  }, [t, toast]);

  return {
    isLoading,
    translations,
    missingTranslations,
    namespaces,
    loadNamespaceTranslations,
    loadNamespaces,
    checkMissingTranslations
  };
}
