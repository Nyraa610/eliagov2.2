
import React from 'react';
import { PlusCircle } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useTranslation } from "react-i18next";
import { LanguageInfo } from "@/services/translation";

interface AddTranslationTabProps {
  availableLanguages: LanguageInfo[];
  selectedNamespace: string;
  newKeyName: string;
  setNewKeyName: React.Dispatch<React.SetStateAction<string>>;
  newKeyValues: {[code: string]: string};
  setNewKeyValues: React.Dispatch<React.SetStateAction<{[code: string]: string}>>;
  addTranslationKey: () => Promise<void>;
}

export function AddTranslationTab({
  availableLanguages,
  selectedNamespace,
  newKeyName,
  setNewKeyName,
  newKeyValues,
  setNewKeyValues,
  addTranslationKey
}: AddTranslationTabProps) {
  const { t } = useTranslation();

  return (
    <div className="grid gap-4">
      <div>
        <Label htmlFor="new-key-namespace">{t('admin.translations.namespace', 'Namespace')}</Label>
        <div className="py-2 px-4 border rounded-md bg-muted/30">
          {selectedNamespace}
        </div>
      </div>
      
      <div>
        <Label htmlFor="new-key-name">{t('admin.translations.keyName', 'Key Name')}</Label>
        <Input
          id="new-key-name"
          placeholder={t('admin.translations.keyNamePlaceholder', 'Enter key name (e.g. button.submit)')}
          value={newKeyName}
          onChange={(e) => setNewKeyName(e.target.value)}
        />
      </div>
      
      {availableLanguages.filter(l => l.enabled).map((lang) => (
        <div key={lang.code}>
          <Label htmlFor={`new-key-value-${lang.code}`}>
            {t('admin.translations.valueFor', 'Value for {{language}}', { language: lang.name })}
          </Label>
          <Input
            id={`new-key-value-${lang.code}`}
            placeholder={t('admin.translations.enterTranslation', 'Enter translation for {{language}}', { language: lang.name })}
            value={newKeyValues[lang.code] || ''}
            onChange={(e) => setNewKeyValues({...newKeyValues, [lang.code]: e.target.value})}
          />
        </div>
      ))}
      
      <Button
        onClick={addTranslationKey}
        disabled={!newKeyName}
        className="mt-4 gap-2"
      >
        <PlusCircle className="h-4 w-4" />
        {t('admin.translations.addKey', 'Add Translation Key')}
      </Button>
    </div>
  );
}
