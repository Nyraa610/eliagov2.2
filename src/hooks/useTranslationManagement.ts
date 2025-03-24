
import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  translationService, 
  TranslationEntry, 
  availableLanguages,
  translationNamespaces,
  TranslationNamespace,
  LanguageInfo
} from '@/services/translationService';
import { useToast } from '@/components/ui/use-toast';

export function useTranslationManagement() {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [namespaces, setNamespaces] = useState<TranslationNamespace[]>([]);
  const [selectedNamespace, setSelectedNamespace] = useState<string>(translationNamespaces[0]);
  const [selectedLanguage, setSelectedLanguage] = useState<string>(i18n.language);
  const [translations, setTranslations] = useState<{[key: string]: string}>({});
  const [missingTranslations, setMissingTranslations] = useState<{[language: string]: string[]}>({});

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

  // Update a single translation
  const updateTranslation = useCallback(async (key: string, value: string) => {
    setIsLoading(true);
    try {
      const fullKey = selectedNamespace ? `${selectedNamespace}.${key}` : key;
      const success = await translationService.updateTranslation({
        key: fullKey,
        languageCode: selectedLanguage,
        value
      });
      
      if (success) {
        toast({
          title: t('common.success'),
          description: t('admin.translations.updateSuccess'),
        });
        
        // Update the local state
        setTranslations(prev => ({
          ...prev,
          [key]: value
        }));
      } else {
        toast({
          title: t('common.error'),
          description: t('admin.translations.updateError'),
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: t('common.error'),
        description: t('admin.translations.updateError'),
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  }, [selectedLanguage, selectedNamespace, t, toast]);

  // Load all available namespaces
  const loadNamespaces = useCallback(async () => {
    setIsLoading(true);
    try {
      // In a real implementation, this would fetch from the database
      // For now, we'll use the predefined list
      const namespacesData = await Promise.all(
        translationNamespaces.map(async name => {
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

  // Add a new translation key
  const addTranslationKey = useCallback(async (key: string, translations: {[language: string]: string}) => {
    setIsLoading(true);
    try {
      const success = await translationService.addTranslationKey(selectedNamespace, key, translations);
      
      if (success) {
        toast({
          title: t('common.success'),
          description: t('admin.translations.keyAdded'),
        });
        
        // Reload the current namespace translations
        await loadNamespaceTranslations(selectedNamespace, selectedLanguage);
      } else {
        toast({
          title: t('common.error'),
          description: t('admin.translations.errorAddingKey'),
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: t('common.error'),
        description: t('admin.translations.errorAddingKey'),
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  }, [loadNamespaceTranslations, selectedLanguage, selectedNamespace, t, toast]);

  // Export all translations
  const exportTranslations = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await translationService.exportTranslations();
      const jsonString = JSON.stringify(data, null, 2);
      
      // Create a blob and download it
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'translations-export.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: t('common.success'),
        description: t('admin.translations.exportSuccess'),
      });
    } catch (error) {
      toast({
        title: t('common.error'),
        description: t('admin.translations.exportError'),
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  }, [t, toast]);

  return {
    isLoading,
    availableLanguages,
    translationNamespaces,
    namespaces,
    selectedNamespace,
    setSelectedNamespace,
    selectedLanguage,
    setSelectedLanguage,
    translations,
    missingTranslations,
    loadNamespaceTranslations,
    updateTranslation,
    loadNamespaces,
    checkMissingTranslations,
    addTranslationKey,
    exportTranslations
  };
}
