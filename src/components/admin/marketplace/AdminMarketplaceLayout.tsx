
import React, { ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate, useLocation } from "react-router-dom";

interface AdminMarketplaceLayoutProps {
  children: ReactNode;
}

export function AdminMarketplaceLayout({ children }: AdminMarketplaceLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  
  const currentTab = location.pathname.split("/").pop() || "partners";
  
  const handleTabChange = (value: string) => {
    navigate(`/admin/marketplace/${value}`);
  };
  
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Marketplace Management</h1>
      
      <Tabs value={currentTab} onValueChange={handleTabChange}>
        <TabsList className="mb-6">
          <TabsTrigger value="partners">Partners</TabsTrigger>
          <TabsTrigger value="applications">Applications</TabsTrigger>
          <TabsTrigger value="leads">Leads & Commission</TabsTrigger>
        </TabsList>
        
        <Card className="p-6">
          {children}
        </Card>
      </Tabs>
    </div>
  );
}
