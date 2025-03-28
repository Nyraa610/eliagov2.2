
import React, { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
} from "@/components/ui/tabs";
import { Globe } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useTranslationManagement } from "@/hooks/useTranslationManagement";
import { TranslationSelector } from "./TranslationSelector";
import { TranslationToolbar } from "./TranslationToolbar";
import { EditTranslationsTab } from "./tabs/EditTranslationsTab";
import { AddTranslationTab } from "./tabs/AddTranslationTab";
import { MissingTranslationsTab } from "./tabs/MissingTranslationsTab";

export function TranslationManagement() {
  const { t } = useTranslation();
  const {
    isLoading,
    availableLanguages,
    translationNamespaces,
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
  } = useTranslationManagement();

  const [searchQuery, setSearchQuery] = useState("");
  const [newKeyName, setNewKeyName] = useState("");
  const [newKeyValues, setNewKeyValues] = useState<{[code: string]: string}>({});
  const [currentTab, setCurrentTab] = useState("edit");

  // Initialize component
  useEffect(() => {
    loadNamespaces();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load translations when namespace or language changes
  useEffect(() => {
    if (selectedNamespace && selectedLanguage) {
      loadNamespaceTranslations(selectedNamespace, selectedLanguage);
    }
  }, [selectedNamespace, selectedLanguage, loadNamespaceTranslations]);

  // Handle checking for missing translations
  const handleCheckMissing = async () => {
    await checkMissingTranslations();
    setCurrentTab("missing");
  };

  // Handle exporting translations
  const handleExport = async () => {
    await exportTranslations();
  };

  // Handle adding a new translation key
  const handleAddKey = async () => {
    if (!newKeyName) return;
    
    await addTranslationKey(newKeyName, newKeyValues);
    setNewKeyName("");
    setNewKeyValues({});
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Globe className="mr-2 h-5 w-5" />
          {t('admin.translations.title', 'Translation Management')}
        </CardTitle>
        <CardDescription>
          {t('admin.translations.description', 'Manage application translations and language settings')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={currentTab} onValueChange={setCurrentTab}>
          <TranslationToolbar 
            currentTab={currentTab} 
            handleCheckMissing={handleCheckMissing}
            handleExport={handleExport}
          />

          <TabsContent value="edit" className="space-y-6">
            <TranslationSelector
              selectedNamespace={selectedNamespace}
              setSelectedNamespace={setSelectedNamespace}
              selectedLanguage={selectedLanguage}
              setSelectedLanguage={setSelectedLanguage}
              translationNamespaces={translationNamespaces}
              availableLanguages={availableLanguages}
              isLoading={isLoading}
            />
            
            <EditTranslationsTab
              isLoading={isLoading}
              translations={translations}
              updateTranslation={updateTranslation}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
            />
          </TabsContent>

          <TabsContent value="add" className="space-y-6">
            <AddTranslationTab
              availableLanguages={availableLanguages}
              selectedNamespace={selectedNamespace}
              newKeyName={newKeyName}
              setNewKeyName={setNewKeyName}
              newKeyValues={newKeyValues}
              setNewKeyValues={setNewKeyValues}
              addTranslationKey={handleAddKey}
            />
          </TabsContent>

          <TabsContent value="missing" className="space-y-6">
            <MissingTranslationsTab 
              isLoading={isLoading}
              missingTranslations={missingTranslations}
              checkMissingTranslations={checkMissingTranslations}
              availableLanguages={availableLanguages}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
