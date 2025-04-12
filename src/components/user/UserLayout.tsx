
import React, { ReactNode } from 'react';
import { Outlet } from 'react-router-dom';
import { Navigation } from '../Navigation';
import { UserSidebar } from './UserSidebar';
import { HotjarTracking } from '../analytics/HotjarTracking';

interface UserLayoutProps {
  children?: ReactNode;
  title?: string;
}

export function UserLayout({ children, title }: UserLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      {/* Add Hotjar tracking - uncomment and add your Hotjar ID when ready */}
      {/* <HotjarTracking siteId="YOUR_HOTJAR_SITE_ID" /> */}
      
      <div className="flex">
        <UserSidebar />
        
        <main className="flex-1 p-6 pt-24">
          <div className="container mx-auto max-w-6xl">
            {title && <h1 className="text-2xl font-bold mb-6">{title}</h1>}
            {children || <Outlet />}
          </div>
        </main>
      </div>
    </div>
  );
}
