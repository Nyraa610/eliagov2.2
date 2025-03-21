
import { Shield } from "lucide-react";
import { CardTitle, CardDescription } from "@/components/ui/card";
import { useTranslation } from "react-i18next";

export function AdminHeader() {
  const { t } = useTranslation();
  
  return (
    <div className="flex items-center space-x-4 mb-2">
      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
        <Shield className="h-6 w-6 text-primary" />
      </div>
      <div>
        <CardTitle>{t('profile.adminSection')}</CardTitle>
        <CardDescription>
          {t('profile.adminTools')}
        </CardDescription>
      </div>
    </div>
  );
}
