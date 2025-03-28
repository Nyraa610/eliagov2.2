
import React from 'react';
import { AlertCircle, Download } from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { useTranslation } from "react-i18next";

interface TranslationToolbarProps {
  currentTab: string;
  handleCheckMissing: () => Promise<void>;
  handleExport: () => Promise<void>;
}

export function TranslationToolbar({
  currentTab,
  handleCheckMissing,
  handleExport
}: TranslationToolbarProps) {
  const { t } = useTranslation();

  return (
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
  );
}
