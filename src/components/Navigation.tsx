
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
import { supabase, setupAuthListener } from '@/lib/supabase';
import { PointsDisplay } from './engagement/PointsDisplay';
import { BadgeDisplay } from './engagement/BadgeDisplay';
import { EngagementTracker } from './engagement/EngagementTracker';
import { supabaseService } from '@/services/base/supabaseService';
import { UserProfile } from '@/services/base/profileTypes';

export function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [authStatus, setAuthStatus] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();
  
  // Check if a route is active
  const isActive = (path: string) => location.pathname === path;
  
  // Fetch user profile and set up auth listener
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase.auth.getSession();
        const isAuth = !!data.session?.user;
        setAuthStatus(isAuth);
        
        if (isAuth) {
          console.log("Navigation: User is authenticated, fetching profile");
          const profile = await supabaseService.getUserProfile();
          setUserProfile(profile);
        } else {
          console.log("Navigation: User is not authenticated");
          setUserProfile(null);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserData();
    
    // Set up auth listener to update auth state in real-time
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log(`Navigation: Auth state changed - Event: ${event}`);
        
        try {
          if (session?.user) {
            console.log("Navigation: New session detected for user:", session.user.id);
            setAuthStatus(true);
            
            // Fetch updated user profile
            const profile = await supabaseService.getUserProfile();
            setUserProfile(profile);
          } else if (event === 'SIGNED_OUT') {
            console.log("Navigation: User signed out");
            setAuthStatus(false);
            setUserProfile(null);
          } else {
            // Handle other auth state changes
            const { data } = await supabase.auth.getSession();
            setAuthStatus(!!data.session);
          }
        } catch (error: any) {
          console.error("Navigation: Error in auth change listener:", error);
        }
      }
    );
    
    return () => {
      console.log("Navigation: Cleaning up auth listener");
      authListener.subscription.unsubscribe();
    };
  }, []);
  
  // Handle logout
  const handleLogout = async () => {
    try {
      setIsLoading(true);
      await supabaseService.signOut();
      setAuthStatus(false);
      setUserProfile(null);
      console.log("User logged out successfully");
      
      // Navigate to the home page using window.location to ensure a full refresh
      window.location.href = '/';
    } catch (error) {
      console.error("Error signing out:", error);
    } finally {
      setIsLoading(false);
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
          
          {!isLoading && authStatus && (
            <DesktopNavigation 
              isAuthenticated={authStatus} 
              userProfile={userProfile} 
              isActive={isActive}
              onLogout={handleLogout}
            />
          )}
        </div>
        
        <div className="flex items-center">
          {!isLoading && authStatus && (
            <>
              <div className="hidden md:flex items-center">
                <PointsDisplay />
                <BadgeDisplay />
              </div>
              <NotificationButton />
            </>
          )}
          
          <LanguageSelector />
          
          {isLoading ? (
            <div className="animate-pulse h-8 w-8 bg-gray-200 rounded-full ml-2"></div>
          ) : authStatus ? (
            <UserMenu userProfile={userProfile} onLogout={handleLogout} />
          ) : (
            <AuthButtons />
          )}
          
          {!isLoading && authStatus && (
            <MobileMenuButton 
              isOpen={mobileMenuOpen} 
              onToggle={() => setMobileMenuOpen(!mobileMenuOpen)} 
            />
          )}
        </div>
      </div>
      
      {!isLoading && authStatus && (
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
