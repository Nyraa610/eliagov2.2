
import { useTranslation } from "react-i18next";
import { LanguageSelector } from "@/components/LanguageSelector";
import { NotificationButton } from "./NotificationButton";
import { UserMenu } from "./UserMenu";
import { AuthButtons } from "./AuthButtons";
import { NavigationLink } from "./NavigationLink";
import { UserProfile } from "@/services/base/supabaseService";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Rocket } from "lucide-react";

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

  // Post-authentication navigation
  return (
    <nav className="hidden md:flex items-center space-x-1">
      <div className="ml-2">
        <LanguageSelector />
      </div>
      <div className="border-l border-gray-200 h-8 mx-1"></div>
      
      <NotificationButton />
      <UserMenu userProfile={userProfile} onLogout={onLogout} />
    </nav>
  );
};
