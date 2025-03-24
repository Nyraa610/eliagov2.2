
import React from "react";
import { Navigation } from "@/components/Navigation";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

interface AdminLayoutProps {
  title: string;
  description?: string; // Make description optional
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ title, description, children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-sage-light/10 to-mediterranean-light/10">
      <Navigation />
      
      <div className="pt-16 flex min-h-[calc(100vh-64px)]">
        <AdminSidebar />
        
        <main className="flex-1 p-6">
          <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex flex-col gap-1">
              <h1 className="text-3xl font-bold text-primary">{title}</h1>
              {description && (
                <p className="text-muted-foreground">{description}</p>
              )}
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
