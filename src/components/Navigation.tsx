import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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

import { LanguageSelectorButton } from './LanguageSelectorButton';
import { AuthButtons } from './AuthButtons';
import { UserMenu } from './UserMenu';
import { MobileMenu } from './MobileMenu';
import { MobileMenuButton } from './MobileMenuButton';
import { DesktopNavigation } from './DesktopNavigation';
import { NotificationButton } from './NotificationButton';
import { isAuthenticated } from '@/lib/supabase';
import { PointsDisplay } from './engagement/PointsDisplay';
import { BadgeDisplay } from './engagement/BadgeDisplay';
import { EngagementTracker } from './engagement/EngagementTracker';

export function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
          
          {isAuthenticated && <DesktopNavigation />}
        </div>
        
        <div className="flex items-center">
          {isAuthenticated && (
            <>
              <div className="hidden md:flex items-center">
                <PointsDisplay />
                <BadgeDisplay />
              </div>
              <NotificationButton />
            </>
          )}
          
          <LanguageSelectorButton />
          
          {isAuthenticated ? (
            <UserMenu />
          ) : (
            <AuthButtons />
          )}
          
          {isAuthenticated && <MobileMenuButton />}
        </div>
      </div>
      
      {isAuthenticated && (
        <MobileMenu isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
      )}
    </div>
  );
}
