
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
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useTranslation } from "react-i18next";
import { useTranslationManagement } from "@/hooks/useTranslationManagement";
import { Search, PlusCircle, Download, AlertCircle, Globe, Check, X } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

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
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
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

  // Filter translations based on search query
  const filteredTranslations = Object.entries(translations).filter(
    ([key, value]) => 
      key.toLowerCase().includes(searchQuery.toLowerCase()) || 
      value.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Start editing a translation
  const handleEdit = (key: string, value: string) => {
    setEditingKey(key);
    setEditValue(value);
  };

  // Save edited translation
  const handleSave = async (key: string) => {
    await updateTranslation(key, editValue);
    setEditingKey(null);
    setEditValue("");
  };

  // Cancel editing
  const handleCancel = () => {
    setEditingKey(null);
    setEditValue("");
  };

  // Add a new translation key
  const handleAddKey = async () => {
    if (!newKeyName) return;
    
    await addTranslationKey(newKeyName, newKeyValues);
    setNewKeyName("");
    setNewKeyValues({});
  };

  // Initialize new key values for all languages
  const initializeNewKeyValues = () => {
    const values = {};
    availableLanguages.forEach(lang => {
      if (lang.enabled) {
        values[lang.code] = "";
      }
    });
    setNewKeyValues(values);
    return values;
  };

  // Check for missing translations
  const handleCheckMissing = async () => {
    await checkMissingTranslations();
    setCurrentTab("missing");
  };

  // Export all translations
  const handleExport = async () => {
    await exportTranslations();
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
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <TabsList className="mb-4 md:mb-0">
              <TabsTrigger value="edit">{t('admin.translations.editTab', 'Edit Translations')}</TabsTrigger>
              <TabsTrigger value="add">{t('admin.translations.addTab', 'Add New Translations')}</TabsTrigger>
              <TabsTrigger value="missing">{t('admin.translations.missingTab', 'Missing Translations')}</TabsTrigger>
            </TabsList>
            
            <div className="flex flex-col md:flex-row gap-2">
              <Button onClick={handleCheckMissing} variant="outline" className="gap-2">
                <AlertCircle className="h-4 w-4" />
                {t('admin.translations.checkMissing', 'Check Missing')}
              </Button>
              <Button onClick={handleExport} variant="outline" className="gap-2">
                <Download className="h-4 w-4" />
                {t('admin.translations.export', 'Export')}
              </Button>
            </div>
          </div>

          <TabsContent value="edit" className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="w-full md:w-1/3">
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
              
              <div className="w-full md:w-1/3">
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
              
              <div className="w-full md:w-1/3">
                <Label htmlFor="search-translations">{t('admin.translations.search', 'Search')}</Label>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search-translations"
                    placeholder={t('admin.translations.searchPlaceholder', 'Search keys or values...')}
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <ScrollArea className="h-[500px] w-full">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-1/3">{t('admin.translations.key', 'Key')}</TableHead>
                    <TableHead className="w-1/2">{t('admin.translations.value', 'Value')}</TableHead>
                    <TableHead className="w-1/6 text-right">{t('admin.translations.actions', 'Actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center">
                        {t('common.loading', 'Loading...')}
                      </TableCell>
                    </TableRow>
                  ) : filteredTranslations.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center">
                        {t('admin.translations.noTranslations', 'No translations found')}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredTranslations.map(([key, value]) => (
                      <TableRow key={key}>
                        <TableCell className="font-mono text-xs">{key}</TableCell>
                        <TableCell>
                          {editingKey === key ? (
                            <Input
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              autoFocus
                            />
                          ) : (
                            value
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {editingKey === key ? (
                            <div className="flex justify-end gap-2">
                              <Button
                                onClick={() => handleSave(key)}
                                size="sm"
                                variant="default"
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                              <Button
                                onClick={handleCancel}
                                size="sm"
                                variant="outline"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ) : (
                            <Button
                              onClick={() => handleEdit(key, value)}
                              size="sm"
                              variant="ghost"
                            >
                              {t('common.edit', 'Edit')}
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="add" className="space-y-6">
            <div className="grid gap-4">
              <div>
                <Label htmlFor="new-key-namespace">{t('admin.translations.namespace', 'Namespace')}</Label>
                <Select
                  value={selectedNamespace}
                  onValueChange={setSelectedNamespace}
                  disabled={isLoading}
                >
                  <SelectTrigger id="new-key-namespace" className="w-full">
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
                onClick={handleAddKey}
                disabled={!newKeyName}
                className="mt-4 gap-2"
              >
                <PlusCircle className="h-4 w-4" />
                {t('admin.translations.addKey', 'Add Translation Key')}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="missing" className="space-y-6">
            <div className="mb-4">
              <Button onClick={handleCheckMissing} disabled={isLoading}>
                {t('admin.translations.refreshMissing', 'Refresh Missing Translations')}
              </Button>
            </div>
            
            {Object.keys(missingTranslations).length === 0 ? (
              <div className="text-center p-8 bg-muted/30 rounded-lg">
                <p>{t('admin.translations.noMissingFound', 'No missing translations found or check has not been run yet.')}</p>
              </div>
            ) : (
              <div className="space-y-6">
                {Object.entries(missingTranslations).map(([langCode, keys]) => (
                  <Card key={langCode}>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Globe className="mr-2 h-5 w-5" />
                        {availableLanguages.find(l => l.code === langCode)?.name} 
                        <Badge variant="outline" className="ml-2">
                          {keys.length} {t('admin.translations.missingKeys', 'missing keys')}
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {keys.length > 0 ? (
                        <ScrollArea className="h-[200px]">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {keys.map((key) => (
                              <div key={key} className="font-mono text-xs bg-muted p-2 rounded">
                                {key}
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                      ) : (
                        <p>{t('admin.translations.allTranslated', 'All keys are translated.')}</p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
