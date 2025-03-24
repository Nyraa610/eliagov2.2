
import React from 'react';
import { LanguageSelector } from '@/components/LanguageSelector';
import { useTranslation } from 'react-i18next';

export const LanguageSelectorButton: React.FC = () => {
  // Add useTranslation hook to ensure language changes affect this component
  const { t } = useTranslation();
  
  return <LanguageSelector />;
};
