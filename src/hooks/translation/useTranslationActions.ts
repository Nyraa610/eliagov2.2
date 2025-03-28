
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useToast } from '@/components/ui/use-toast';
import { translationService, TranslationEntry } from '@/services/translationService';

export function useTranslationActions() {
  const { t } = useTranslation();
  const { toast } = useToast();

  // Update a single translation
  const updateTranslation = useCallback(async (
    selectedLanguage: string,
    selectedNamespace: string,
    key: string,
    value: string
  ): Promise<void> => {
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
    }
  }, [t, toast]);

  // Add a new translation key
  const addTranslationKey = useCallback(async (
    selectedNamespace: string,
    key: string,
    translations: {[language: string]: string}
  ): Promise<boolean> => {
    try {
      const success = await translationService.addTranslationKey(selectedNamespace, key, translations);
      
      if (success) {
        toast({
          title: t('common.success'),
          description: t('admin.translations.keyAdded'),
        });
        return true;
      } else {
        toast({
          title: t('common.error'),
          description: t('admin.translations.errorAddingKey'),
          variant: 'destructive'
        });
        return false;
      }
    } catch (error) {
      toast({
        title: t('common.error'),
        description: t('admin.translations.errorAddingKey'),
        variant: 'destructive'
      });
      return false;
    }
  }, [t, toast]);

  // Export all translations
  const exportTranslations = useCallback(async () => {
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
      
      return true;
    } catch (error) {
      toast({
        title: t('common.error'),
        description: t('admin.translations.exportError'),
        variant: 'destructive'
      });
      return false;
    }
  }, [t, toast]);

  return {
    updateTranslation,
    addTranslationKey,
    exportTranslations
  };
}
