
import React, { ReactNode } from "react";
import { Outlet } from "react-router-dom";

export interface AdminLayoutProps {
  title?: string;
  description?: string;
  children?: ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ title, description, children }) => {
  return (
    <div className="space-y-6">
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
  );
};
