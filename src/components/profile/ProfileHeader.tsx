
import { User } from "lucide-react";
import { CardDescription } from "@/components/ui/card";
import { useTranslation } from "react-i18next";

interface ProfileHeaderProps {
  isAdmin: boolean;
}

export function ProfileHeader({ isAdmin }: ProfileHeaderProps) {
  const { t } = useTranslation();

  return (
    <>
      <div className="flex items-center space-x-4 mb-2">
        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
          <User className="h-6 w-6 text-primary" />
        </div>
        <div>
          <CardDescription>
            {t("profile.manageAccount")}
          </CardDescription>
        </div>
      </div>
      {isAdmin && (
        <div className="bg-primary/10 text-primary rounded-md px-3 py-1 text-sm inline-block ml-16">
          {t("profile.administrator")}
        </div>
      )}
    </>
  );
}
