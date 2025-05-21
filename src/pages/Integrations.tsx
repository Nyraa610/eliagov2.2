
import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate, useParams } from "react-router-dom";
import NotionIntegration from "@/components/integrations/notion/NotionIntegration";
import ActionPlanExport from "@/components/integrations/notion/ActionPlanExport";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, Database } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function Integrations() {
  const navigate = useNavigate();
  const { integrationTab } = useParams();
  const [activeTab, setActiveTab] = useState<string>(integrationTab || "notion");
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    navigate(`/integrations/${value}`);
  };

  if (authLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-6">Integrations</h1>
        <div className="flex justify-center p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-6">Integrations</h1>
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2 mb-1">
              <Database className="h-6 w-6" />
              <CardTitle>Authentication Required</CardTitle>
            </div>
            <CardDescription>
              You need to be logged in to access integrations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3 p-4 border rounded bg-amber-50">
              <AlertCircle className="h-5 w-5 text-amber-500 shrink-0" />
              <div className="text-amber-800">
                Please sign in to access and manage your integrations.
              </div>
            </div>
            <Button onClick={() => navigate('/login')} className="w-full">
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Integrations</h1>
      
      <Tabs 
        value={activeTab} 
        onValueChange={handleTabChange}
        className="space-y-6"
      >
        <TabsList>
          <TabsTrigger value="notion">Notion</TabsTrigger>
          {/* Add more integrations here in the future */}
        </TabsList>
        
        <TabsContent value="notion" className="space-y-6">
          <NotionIntegration />
        </TabsContent>
      </Tabs>
    </div>
  );
}
