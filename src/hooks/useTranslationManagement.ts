
import { useCallback } from 'react';
import { useTranslationLoaders } from './translation/useTranslationLoaders';
import { useTranslationState } from './translation/useTranslationState';
import { useTranslationActions } from './translation/useTranslationActions';

export function useTranslationManagement() {
  const { 
    isLoading, 
    translations, 
    missingTranslations,
    namespaces,
    loadNamespaceTranslations, 
    loadNamespaces, 
    checkMissingTranslations 
  } = useTranslationLoaders();
  
  const {
    availableLanguages,
    translationNamespaces,
    selectedNamespace,
    setSelectedNamespace,
    selectedLanguage,
    setSelectedLanguage
  } = useTranslationState();

  const {
    updateTranslation: updateTranslationBase,
    addTranslationKey: addTranslationKeyBase,
    exportTranslations
  } = useTranslationActions();

  // Wrapper for updateTranslation that uses current state
  const updateTranslation = useCallback((key: string, value: string) => {
    return updateTranslationBase(selectedLanguage, selectedNamespace, key, value);
  }, [updateTranslationBase, selectedLanguage, selectedNamespace]);

  // Wrapper for addTranslationKey that uses current state
  const addTranslationKey = useCallback((key: string, translations: {[language: string]: string}) => {
    return addTranslationKeyBase(selectedNamespace, key, translations);
  }, [addTranslationKeyBase, selectedNamespace]);

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
