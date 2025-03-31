
import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navigation } from '../Navigation';
import { UserSidebar } from './UserSidebar';

export function UserLayout() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="flex">
        <UserSidebar />
        
        <main className="flex-1 p-6 pt-24">
          <div className="container mx-auto max-w-6xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
