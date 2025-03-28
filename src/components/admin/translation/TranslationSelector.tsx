
import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useTranslation } from "react-i18next";
import { LanguageInfo } from "@/services/translationService";

interface TranslationSelectorProps {
  selectedNamespace: string;
  setSelectedNamespace: (namespace: string) => void;
  selectedLanguage: string;
  setSelectedLanguage: (language: string) => void;
  translationNamespaces: string[];
  availableLanguages: LanguageInfo[];
  isLoading: boolean;
}

export function TranslationSelector({
  selectedNamespace,
  setSelectedNamespace,
  selectedLanguage,
  setSelectedLanguage,
  translationNamespaces,
  availableLanguages,
  isLoading
}: TranslationSelectorProps) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col md:flex-row gap-4 mb-6">
      <div className="w-full md:w-1/2">
        <Label htmlFor="namespace-select">{t('admin.translations.namespace', 'Namespace')}</Label>
        <Select
          value={selectedNamespace}
          onValueChange={setSelectedNamespace}
          disabled={isLoading}
        >
          <SelectTrigger id="namespace-select" className="w-full">
            <SelectValue placeholder={t('admin.translations.selectNamespace', 'Select namespace')} />
          </SelectTrigger>
          <SelectContent>
            {translationNamespaces.map((ns) => (
              <SelectItem key={ns} value={ns}>
                {ns}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="w-full md:w-1/2">
        <Label htmlFor="language-select">{t('admin.translations.language', 'Language')}</Label>
        <Select
          value={selectedLanguage}
          onValueChange={setSelectedLanguage}
          disabled={isLoading}
        >
          <SelectTrigger id="language-select" className="w-full">
            <SelectValue placeholder={t('admin.translations.selectLanguage', 'Select language')} />
          </SelectTrigger>
          <SelectContent>
            {availableLanguages.filter(l => l.enabled).map((lang) => (
              <SelectItem key={lang.code} value={lang.code}>
                {lang.nativeName} ({lang.name})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
