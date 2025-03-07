
import React from "react";
import { Navigation } from "@/components/Navigation";
import { UserSidebar } from "@/components/user/UserSidebar";

interface UserLayoutProps {
  title: string;
  children: React.ReactNode;
}

export const UserLayout: React.FC<UserLayoutProps> = ({ title, children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-sage-light/10 to-mediterranean-light/10">
      <Navigation />
      
      <div className="pt-16 flex min-h-[calc(100vh-64px)]">
        <UserSidebar />
        
        <main className="flex-1 p-6">
          <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-bold text-primary">{title}</h1>
            </div>
            
            <div className="space-y-6">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
