
import React, { ReactNode } from 'react';
import { Outlet } from 'react-router-dom';
import { Navigation } from '../Navigation';
import { UserSidebar } from './UserSidebar';
import { HotjarTracking } from '../analytics/HotjarTracking';
import { ClientProvider } from '@/contexts/ClientContext';
import { SidebarProvider, useSidebar } from '@/contexts/SidebarContext';

interface UserLayoutProps {
  children?: ReactNode;
  title?: string;
}

function MainContent({ children, title }: UserLayoutProps) {
  const { collapsed } = useSidebar();
  
  return (
    <main 
      className="flex-1 p-6 pt-24 transition-all duration-300"
      style={{ marginLeft: collapsed ? '70px' : '240px' }}
    >
      <div className="container mx-auto max-w-6xl">
        {title && <h1 className="text-2xl font-bold mb-6">{title}</h1>}
        {children || <Outlet />}
      </div>
    </main>
  );
}

export function UserLayout({ children, title }: UserLayoutProps) {
  return (
    <ClientProvider>
      <SidebarProvider>
        <div className="min-h-screen bg-background">
          <Navigation />
          {/* Add Hotjar tracking */}
          <HotjarTracking />
          
          <div className="flex">
            <UserSidebar />
            <MainContent title={title}>{children}</MainContent>
          </div>
        </div>
      </SidebarProvider>
    </ClientProvider>
  );
}
