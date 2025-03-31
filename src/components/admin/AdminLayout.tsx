
import React, { ReactNode } from "react";
import { Navigation } from "@/components/Navigation";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Outlet } from "react-router-dom";

export interface AdminLayoutProps {
  title?: string;
  description?: string;
  children?: ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ title, description, children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-sage-light/10 to-mediterranean-light/10">
      <Navigation />
      
      <SidebarProvider>
        <div className="pt-16 flex min-h-[calc(100vh-64px)] w-full">
          <AdminSidebar />
          
          <main className="flex-1 p-6">
            <div className="max-w-6xl mx-auto space-y-6">
              {title && (
                <div className="flex flex-col gap-1">
                  <h1 className="text-3xl font-bold text-primary">{title}</h1>
                  {description && (
                    <p className="text-muted-foreground">{description}</p>
                  )}
                </div>
              )}
              
              <div className="space-y-6">
                {children || <Outlet />}
              </div>
            </div>
          </main>
        </div>
      </SidebarProvider>
    </div>
  );
};
