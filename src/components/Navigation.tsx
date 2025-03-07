
import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { LanguageSelector } from "@/components/LanguageSelector";
import { Logo } from "@/components/Logo";
import { supabaseService } from "@/services/base/supabaseService";
import { 
  DesktopNavigation, 
  MobileMenu, 
  MobileMenuButton 
} from "@/components/navigation";

export const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const user = await supabaseService.getCurrentUser();
      setIsAuthenticated(!!user);
      
      if (user) {
        const profile = await supabaseService.getUserProfile(user.id);
        setUserProfile(profile);
      }
    };
    
    checkAuth();
    
    // Listen for auth state changes
    const { data: authListener } = supabaseService.supabase.auth.onAuthStateChange(
      async (event, session) => {
        setIsAuthenticated(!!session);
        
        if (session?.user) {
          const profile = await supabaseService.getUserProfile(session.user.id);
          setUserProfile(profile);
        } else {
          setUserProfile(null);
        }
      }
    );
    
    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };
  
  const handleLogout = async () => {
    await supabaseService.supabase.auth.signOut();
    navigate("/");
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
          <DesktopNavigation 
            isAuthenticated={isAuthenticated} 
            userProfile={userProfile} 
            isActive={isActive}
            onLogout={handleLogout}
          />

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <LanguageSelector />
            <MobileMenuButton isOpen={isMenuOpen} onToggle={toggleMenu} />
          </div>
        </div>

        {/* Mobile Navigation */}
        <MobileMenu 
          isOpen={isMenuOpen} 
          isAuthenticated={isAuthenticated} 
          isActive={isActive} 
          onToggle={toggleMenu}
          onLogout={handleLogout}
        />
      </div>
    </header>
  );
};
