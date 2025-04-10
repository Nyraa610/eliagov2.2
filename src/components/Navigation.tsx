
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Menu } from "lucide-react";

import { AuthButtons } from './navigation/AuthButtons';
import { UserMenu } from './navigation/UserMenu';
import { MobileMenu } from './navigation/MobileMenu';
import { MobileMenuButton } from './navigation/MobileMenuButton';
import { DesktopNavigation } from './navigation/DesktopNavigation';
import { NotificationButton } from './navigation/NotificationButton';
import { PointsDisplay } from './engagement/PointsDisplay';
import { BadgeDisplay } from './engagement/BadgeDisplay';
import { EngagementTracker } from './engagement/EngagementTracker';
import { UserProfile } from '@/services/base/profileTypes';
import { useAuth } from '@/contexts/AuthContext';
import { supabaseService } from '@/services/base/supabaseService';
import { LanguageSelector } from '@/components/LanguageSelector';

export function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();
  const { isAuthenticated, isLoading: authLoading, user, signOut } = useAuth();
  
  const isActive = (path: string) => location.pathname === path;
  
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!isAuthenticated || !user) {
        setUserProfile(null);
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        console.log("Navigation: User is authenticated, fetching profile");
        const profile = await supabaseService.getUserProfile();
        setUserProfile(profile);
      } catch (error) {
        console.error("Error fetching user profile:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserProfile();
  }, [isAuthenticated, user]);
  
  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <div className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 z-40">
      <EngagementTracker />
      <div className="max-w-7xl mx-auto h-full flex items-center justify-between px-4">
        <div className="flex items-center">
          <Link
            to="/"
            className="flex items-center mr-6"
          >
            <img 
              src="/lovable-uploads/038cd54e-d43d-4877-aa24-981675e8c9f7.png" 
              alt="Logo" 
              className="h-8 w-8 mr-2" 
            />
            <span className="font-bold text-primary hidden md:block">ELIA GO</span>
          </Link>
          
          {!authLoading && isAuthenticated && (
            <DesktopNavigation 
              isAuthenticated={isAuthenticated} 
              userProfile={userProfile} 
              isActive={isActive}
              onLogout={handleLogout}
            />
          )}
        </div>
        
        <div className="flex items-center">
          {!authLoading && isAuthenticated && (
            <>
              <div className="hidden md:flex items-center">
                <PointsDisplay />
                <BadgeDisplay />
              </div>
              <NotificationButton />
            </>
          )}
          
          <LanguageSelector />
          
          {authLoading ? (
            <div className="animate-pulse h-8 w-8 bg-gray-200 rounded-full ml-2"></div>
          ) : isAuthenticated ? (
            <UserMenu userProfile={userProfile} onLogout={handleLogout} />
          ) : (
            <AuthButtons />
          )}
          
          {!authLoading && isAuthenticated && (
            <MobileMenuButton 
              isOpen={mobileMenuOpen} 
              onToggle={() => setMobileMenuOpen(!mobileMenuOpen)} 
            />
          )}
        </div>
      </div>
      
      {!authLoading && isAuthenticated && (
        <MobileMenu 
          isOpen={mobileMenuOpen} 
          onToggle={() => setMobileMenuOpen(!mobileMenuOpen)}
          isAuthenticated={isAuthenticated}
          isActive={isActive}
          onLogout={handleLogout} 
        />
      )}
    </div>
  );
}
