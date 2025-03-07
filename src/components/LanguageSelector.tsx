
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Globe } from 'lucide-react';

export const LanguageSelector: React.FC = () => {
  const { t } = useTranslation();
  const { language, changeLanguage } = useLanguage();

  return (
    <div className="flex items-center gap-2">
      <Globe className="h-4 w-4 text-muted-foreground" />
      <Select
        value={language}
        onValueChange={(value) => changeLanguage(value as 'en' | 'fr' | 'el' | 'es')}
      >
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder={t('common.language')} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="en">{t('common.english')}</SelectItem>
          <SelectItem value="fr">{t('common.french')}</SelectItem>
          <SelectItem value="el">{t('common.greek')}</SelectItem>
          <SelectItem value="es">{t('common.spanish')}</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};
