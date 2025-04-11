
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { NavigationLink } from "./NavigationLink";
import { Rocket, CreditCard } from "lucide-react";

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

  // Pre-authentication mobile menu
  if (!isAuthenticated) {
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
            to="/pricing" 
            isActive={isActive("/pricing")} 
            onClick={onToggle}
            className="w-full text-left justify-start"
          >
            <CreditCard className="h-4 w-4 mr-1" />
            {t('navigation.plans')}
          </NavigationLink>
          
          <Link to="/assessment" onClick={onToggle} className="mt-2">
            <Button className="w-full bg-green-600 hover:bg-green-700 text-white font-medium">
              <Rocket size={18} />
              {t('assessment.getStarted')}
            </Button>
          </Link>
          
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
        </div>
      </div>
    );
  }

  // Post-authentication mobile menu
  return (
    <div className="md:hidden pb-4">
      <div className="flex flex-col space-y-2">
        <NavigationLink 
          to="/dashboard" 
          isActive={isActive("/dashboard")} 
          onClick={onToggle}
          className="w-full text-left justify-start"
        >
          {t('navigation.dashboard')}
        </NavigationLink>
        <NavigationLink 
          to="/assessment" 
          isActive={isActive("/assessment")} 
          onClick={onToggle}
          className="w-full text-left justify-start"
        >
          {t('navigation.assessment')}
        </NavigationLink>
        <NavigationLink 
          to="/pricing" 
          isActive={isActive("/pricing")} 
          onClick={onToggle}
          className="w-full text-left justify-start"
        >
          <CreditCard className="h-4 w-4 mr-1" />
          {t('navigation.plans')}
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
    </div>
  );
};
