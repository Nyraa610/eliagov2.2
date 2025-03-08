
import { CardDescription, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Globe } from "lucide-react";
import { LanguageSelector } from "@/components/LanguageSelector";
import { useTranslation } from "react-i18next";

export function LanguageSettings() {
  const { t } = useTranslation();

  return (
    <>
      <div className="flex items-center space-x-4 mb-2">
        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
          <Globe className="h-6 w-6 text-primary" />
        </div>
        <div>
          <CardTitle className="text-xl">{t("profile.languageSettings")}</CardTitle>
          <CardDescription>
            {t("profile.changeLanguage")}
          </CardDescription>
        </div>
      </div>
      <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-8">
        <Label htmlFor="language" className="md:w-1/4">{t("common.language")}</Label>
        <div className="flex-1">
          <LanguageSelector />
        </div>
      </div>
    </>
  );
}
