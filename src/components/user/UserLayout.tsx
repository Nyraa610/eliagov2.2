
import React, { ReactNode } from 'react';
import { Outlet } from 'react-router-dom';
import { Navigation } from '../Navigation';
import { UserSidebar } from './UserSidebar';

interface UserLayoutProps {
  children?: ReactNode;
  title?: string;
}

export function UserLayout({ children, title }: UserLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="flex">
        <UserSidebar />
        
        <main className="flex-1 p-6 pt-24">
          <div className="container mx-auto max-w-6xl">
            {children || <Outlet />}
          </div>
        </main>
      </div>
    </div>
  );
}
