
import React from 'react';
import { Globe } from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useTranslation } from "react-i18next";
import { LanguageInfo } from "@/services/translation";

interface MissingTranslationsTabProps {
  isLoading: boolean;
  missingTranslations: {[language: string]: string[]};
  checkMissingTranslations: () => Promise<void>;
  availableLanguages: LanguageInfo[];
}

export function MissingTranslationsTab({
  isLoading,
  missingTranslations,
  checkMissingTranslations,
  availableLanguages
}: MissingTranslationsTabProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <div className="mb-4">
        <Button onClick={checkMissingTranslations} disabled={isLoading}>
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
    </div>
  );
}
