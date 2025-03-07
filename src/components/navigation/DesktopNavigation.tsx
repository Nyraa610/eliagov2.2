
import { useTranslation } from "react-i18next";
import { LanguageSelector } from "@/components/LanguageSelector";
import { NotificationButton } from "./NotificationButton";
import { UserMenu } from "./UserMenu";
import { AuthButtons } from "./AuthButtons";
import { NavigationLink } from "./NavigationLink";
import { UserProfile } from "@/services/base/supabaseService";

interface DesktopNavigationProps {
  isAuthenticated: boolean | null;
  userProfile: UserProfile | null;
  isActive: (path: string) => boolean;
  onLogout: () => Promise<void>;
}

export const DesktopNavigation = ({ 
  isAuthenticated, 
  userProfile, 
  isActive,
  onLogout 
}: DesktopNavigationProps) => {
  const { t } = useTranslation();

  return (
    <nav className="hidden md:flex items-center space-x-1">
      <NavigationLink to="/" isActive={isActive("/")}>
        {t('navigation.home')}
      </NavigationLink>
      <NavigationLink to="/features" isActive={isActive("/features")}>
        {t('navigation.features')}
      </NavigationLink>
      <NavigationLink to="/rse-diagnostic" isActive={isActive("/rse-diagnostic")}>
        {t('navigation.rse')}
      </NavigationLink>
      <NavigationLink to="/carbon-footprint" isActive={isActive("/carbon-footprint")}>
        {t('navigation.carbon')}
      </NavigationLink>
      <NavigationLink to="/materiality-analysis" isActive={isActive("/materiality-analysis")}>
        {t('navigation.materiality')}
      </NavigationLink>
      <NavigationLink to="/training" isActive={isActive("/training")}>
        {t('navigation.training')}
      </NavigationLink>
      <div className="ml-2">
        <LanguageSelector />
      </div>
      <div className="border-l border-gray-200 h-8 mx-1"></div>
      
      {isAuthenticated ? (
        <>
          <NotificationButton />
          <UserMenu userProfile={userProfile} onLogout={onLogout} />
        </>
      ) : (
        <AuthButtons />
      )}
    </nav>
  );
};
