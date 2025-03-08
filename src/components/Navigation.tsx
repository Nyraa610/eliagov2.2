
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

import { LanguageSelector } from '@/components/LanguageSelector';
import { AuthButtons } from './navigation/AuthButtons';
import { UserMenu } from './navigation/UserMenu';
import { MobileMenu } from './navigation/MobileMenu';
import { MobileMenuButton } from './navigation/MobileMenuButton';
import { DesktopNavigation } from './navigation/DesktopNavigation';
import { NotificationButton } from './navigation/NotificationButton';
import { isAuthenticated } from '@/lib/supabase';
import { PointsDisplay } from './engagement/PointsDisplay';
import { BadgeDisplay } from './engagement/BadgeDisplay';
import { EngagementTracker } from './engagement/EngagementTracker';
import { supabaseService } from '@/services/base/supabaseService';
import { UserProfile } from '@/services/base/profileTypes';

export function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [authStatus, setAuthStatus] = useState<boolean | null>(null);
  const location = useLocation();
  
  // Check if a route is active
  const isActive = (path: string) => location.pathname === path;
  
  // Fetch user profile
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const isAuth = await isAuthenticated();
        setAuthStatus(isAuth);
        
        if (isAuth) {
          const profile = await supabaseService.getUserProfile();
          setUserProfile(profile);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };
    
    fetchUserData();
  }, []);
  
  // Handle logout
  const handleLogout = async () => {
    try {
      await supabaseService.signOut();
      setAuthStatus(false);
      setUserProfile(null);
      // Reload the page to reset all states
      window.location.href = '/';
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
            <img src="/lovable-uploads/bf07f304-1895-4f5e-a378-715282528884.png" alt="Logo" className="h-8 w-8 mr-2" />
            <span className="font-bold text-primary hidden md:block">ELIA GO</span>
          </Link>
          
          {authStatus && (
            <DesktopNavigation 
              isAuthenticated={authStatus} 
              userProfile={userProfile} 
              isActive={isActive}
              onLogout={handleLogout}
            />
          )}
        </div>
        
        <div className="flex items-center">
          {authStatus && (
            <>
              <div className="hidden md:flex items-center">
                <PointsDisplay />
                <BadgeDisplay />
              </div>
              <NotificationButton />
            </>
          )}
          
          <LanguageSelector />
          
          {authStatus ? (
            <UserMenu userProfile={userProfile} onLogout={handleLogout} />
          ) : (
            <AuthButtons />
          )}
          
          {authStatus && (
            <MobileMenuButton 
              isOpen={mobileMenuOpen} 
              onToggle={() => setMobileMenuOpen(!mobileMenuOpen)} 
            />
          )}
        </div>
      </div>
      
      {authStatus && (
        <MobileMenu 
          isOpen={mobileMenuOpen} 
          onToggle={() => setMobileMenuOpen(!mobileMenuOpen)}
          isAuthenticated={authStatus}
          isActive={isActive}
          onLogout={handleLogout} 
        />
      )}
    </div>
  );
}
