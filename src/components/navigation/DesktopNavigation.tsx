
import { useTranslation } from "react-i18next";
import { LanguageSelector } from "@/components/LanguageSelector";
import { NotificationButton } from "./NotificationButton";
import { UserMenu } from "./UserMenu";
import { AuthButtons } from "./AuthButtons";
import { NavigationLink } from "./NavigationLink";
import { UserProfile } from "@/services/base/supabaseService";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Rocket, CreditCard } from "lucide-react";

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

  // Common navigation links that appear in both authenticated and non-authenticated states
  const commonLinks = (
    <>
      <NavigationLink to="/pricing" isActive={isActive("/pricing")}>
        <CreditCard className="h-4 w-4 mr-1" />
        {t('navigation.plans')}
      </NavigationLink>
    </>
  );

  // Pre-authentication navigation
  if (!isAuthenticated) {
    return (
      <nav className="hidden md:flex items-center space-x-1">
        <NavigationLink to="/" isActive={isActive("/")}>
          {t('navigation.home')}
        </NavigationLink>
        <NavigationLink to="/features" isActive={isActive("/features")}>
          {t('navigation.features')}
        </NavigationLink>
        {commonLinks}
        
        <div className="ml-2">
          <LanguageSelector />
        </div>
        <div className="border-l border-gray-200 h-8 mx-1"></div>
        
        <Link to="/assessment" className="mr-2">
          <Button className="bg-green-600 hover:bg-green-700 text-white font-medium">
            <Rocket size={18} />
            {t('assessment.getStarted')}
          </Button>
        </Link>
        
        <AuthButtons />
      </nav>
    );
  }

  // Post-authentication navigation - simplified
  return (
    <nav className="hidden md:flex items-center space-x-1">
      <NavigationLink to="/dashboard" isActive={isActive("/dashboard")}>
        {t('navigation.dashboard')}
      </NavigationLink>
      <NavigationLink to="/assessment" isActive={isActive("/assessment")}>
        {t('navigation.assessment')}
      </NavigationLink>
      {commonLinks}
    </nav>
  );
};
