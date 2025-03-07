
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { HamburgerMenuIcon, Cross1Icon } from "@radix-ui/react-icons";
import { Logo } from "@/components/Logo";
import { LanguageSelector } from "@/components/LanguageSelector";
import { useTranslation } from "react-i18next";

export const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const { t } = useTranslation();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <header className="w-full bg-white/80 backdrop-blur-sm sticky top-0 z-50 border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center">
            <Logo className="h-10 w-auto" />
            <span className="ml-2 text-xl font-bold text-primary">ELIA GO</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            <Link to="/">
              <Button 
                variant={isActive("/") ? "default" : "ghost"} 
                className={isActive("/") ? "bg-primary text-white" : ""}
              >
                {t('navigation.home')}
              </Button>
            </Link>
            <Link to="/features">
              <Button 
                variant={isActive("/features") ? "default" : "ghost"}
                className={isActive("/features") ? "bg-primary text-white" : ""}
              >
                {t('navigation.features')}
              </Button>
            </Link>
            <Link to="/assessment">
              <Button 
                variant={isActive("/assessment") ? "default" : "ghost"}
                className={isActive("/assessment") ? "bg-primary text-white" : ""}
              >
                {t('navigation.assessment')}
              </Button>
            </Link>
            <Link to="/training">
              <Button 
                variant={isActive("/training") ? "default" : "ghost"}
                className={isActive("/training") ? "bg-primary text-white" : ""}
              >
                {t('navigation.training')}
              </Button>
            </Link>
            <div className="ml-2">
              <LanguageSelector />
            </div>
            <div className="border-l border-gray-200 h-8 mx-1"></div>
            <Link to="/login">
              <Button variant="outline">
                {t('auth.login')}
              </Button>
            </Link>
            <Link to="/register">
              <Button>
                {t('auth.register')}
              </Button>
            </Link>
          </nav>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <LanguageSelector />
            <Button variant="ghost" size="icon" onClick={toggleMenu} className="ml-2">
              {isMenuOpen ? (
                <Cross1Icon className="h-5 w-5" />
              ) : (
                <HamburgerMenuIcon className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden pb-4">
            <div className="flex flex-col space-y-2">
              <Link to="/" onClick={() => setIsMenuOpen(false)}>
                <Button 
                  variant={isActive("/") ? "default" : "ghost"} 
                  className={isActive("/") ? "bg-primary text-white w-full" : "w-full text-left justify-start"}
                >
                  {t('navigation.home')}
                </Button>
              </Link>
              <Link to="/features" onClick={() => setIsMenuOpen(false)}>
                <Button 
                  variant={isActive("/features") ? "default" : "ghost"}
                  className={isActive("/features") ? "bg-primary text-white w-full" : "w-full text-left justify-start"}
                >
                  {t('navigation.features')}
                </Button>
              </Link>
              <Link to="/assessment" onClick={() => setIsMenuOpen(false)}>
                <Button 
                  variant={isActive("/assessment") ? "default" : "ghost"}
                  className={isActive("/assessment") ? "bg-primary text-white w-full" : "w-full text-left justify-start"}
                >
                  {t('navigation.assessment')}
                </Button>
              </Link>
              <Link to="/training" onClick={() => setIsMenuOpen(false)}>
                <Button 
                  variant={isActive("/training") ? "default" : "ghost"}
                  className={isActive("/training") ? "bg-primary text-white w-full" : "w-full text-left justify-start"}
                >
                  {t('navigation.training')}
                </Button>
              </Link>
              <div className="pt-2 flex space-x-2">
                <Link to="/login" onClick={() => setIsMenuOpen(false)} className="w-1/2">
                  <Button variant="outline" className="w-full">
                    {t('auth.login')}
                  </Button>
                </Link>
                <Link to="/register" onClick={() => setIsMenuOpen(false)} className="w-1/2">
                  <Button className="w-full">
                    {t('auth.register')}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
