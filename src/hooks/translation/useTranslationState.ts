
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { availableLanguages, translationNamespaces } from '@/services/translationService';

export function useTranslationState() {
  const { i18n } = useTranslation();
  
  const [selectedNamespace, setSelectedNamespace] = useState<string>(translationNamespaces[0]);
  const [selectedLanguage, setSelectedLanguage] = useState<string>(i18n.language);
  
  return {
    availableLanguages,
    translationNamespaces,
    selectedNamespace,
    setSelectedNamespace,
    selectedLanguage,
    setSelectedLanguage
  };
}
