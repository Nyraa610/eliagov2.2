
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { NavigationLink } from "./NavigationLink";

interface MobileMenuProps {
  isOpen: boolean;
  isAuthenticated: boolean | null;
  isActive: (path: string) => boolean;
  onToggle: () => void;
  onLogout: () => Promise<void>;
}

export const MobileMenu = ({ 
  isOpen, 
  isAuthenticated, 
  isActive, 
  onToggle,
  onLogout 
}: MobileMenuProps) => {
  const { t } = useTranslation();

  if (!isOpen) return null;

  return (
    <div className="md:hidden pb-4">
      <div className="flex flex-col space-y-2">
        <NavigationLink 
          to="/" 
          isActive={isActive("/")} 
          onClick={onToggle}
          className="w-full text-left justify-start"
        >
          {t('navigation.home')}
        </NavigationLink>
        <NavigationLink 
          to="/features" 
          isActive={isActive("/features")} 
          onClick={onToggle}
          className="w-full text-left justify-start"
        >
          {t('navigation.features')}
        </NavigationLink>
        <NavigationLink 
          to="/rse-diagnostic" 
          isActive={isActive("/rse-diagnostic")} 
          onClick={onToggle}
          className="w-full text-left justify-start"
        >
          {t('navigation.rse')}
        </NavigationLink>
        <NavigationLink 
          to="/carbon-footprint" 
          isActive={isActive("/carbon-footprint")} 
          onClick={onToggle}
          className="w-full text-left justify-start"
        >
          {t('navigation.carbon')}
        </NavigationLink>
        <NavigationLink 
          to="/materiality-analysis" 
          isActive={isActive("/materiality-analysis")} 
          onClick={onToggle}
          className="w-full text-left justify-start"
        >
          {t('navigation.materiality')}
        </NavigationLink>
        <NavigationLink 
          to="/training" 
          isActive={isActive("/training")} 
          onClick={onToggle}
          className="w-full text-left justify-start"
        >
          {t('navigation.training')}
        </NavigationLink>
        
        {isAuthenticated ? (
          <div className="flex flex-col space-y-2 pt-2">
            <NavigationLink 
              to="/dashboard" 
              isActive={isActive("/dashboard")} 
              onClick={onToggle}
              className="w-full text-left justify-start"
            >
              {t('navigation.dashboard')}
            </NavigationLink>
            <NavigationLink 
              to="/profile" 
              isActive={isActive("/profile")} 
              onClick={onToggle}
              className="w-full text-left justify-start"
            >
              {t('navigation.profile')}
            </NavigationLink>
            <Button onClick={onLogout} variant="outline" className="w-full">
              {t('auth.logout')}
            </Button>
          </div>
        ) : (
          <div className="pt-2 flex space-x-2">
            <Link to="/login" onClick={onToggle} className="w-1/2">
              <Button variant="outline" className="w-full">
                {t('auth.login')}
              </Button>
            </Link>
            <Link to="/register" onClick={onToggle} className="w-1/2">
              <Button className="w-full">
                {t('auth.register')}
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};
