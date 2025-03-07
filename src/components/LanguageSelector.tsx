
import React from 'react';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Globe } from 'lucide-react';
import { useLanguageSelector } from '@/hooks/useLanguageSelector';

export const LanguageSelector: React.FC = () => {
  const { currentLanguage, handleLanguageChange, languageOptions, t } = useLanguageSelector();

  return (
    <div className="flex items-center gap-2">
      <Globe className="h-4 w-4 text-muted-foreground" />
      <Select
        value={currentLanguage}
        onValueChange={handleLanguageChange}
      >
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder={t('common.language')} />
        </SelectTrigger>
        <SelectContent>
          {languageOptions.map(option => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
