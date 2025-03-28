import React, { useState } from 'react';
import { Search, Check, X } from 'lucide-react';
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { useTranslation } from "react-i18next";

interface EditTranslationsTabProps {
  isLoading: boolean;
  translations: { [key: string]: string };
  updateTranslation: (key: string, value: string) => Promise<void>;
  searchQuery: string;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
}

export function EditTranslationsTab({
  isLoading,
  translations,
  updateTranslation,
  searchQuery,
  setSearchQuery
}: EditTranslationsTabProps) {
  const { t } = useTranslation();
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

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

  return (
    <div className="space-y-6">
      <div className="relative mb-4">
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
    </div>
  );
}
