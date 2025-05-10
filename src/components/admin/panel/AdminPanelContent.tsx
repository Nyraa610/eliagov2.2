
import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OverviewTabContent } from "./OverviewTabContent";
import { TrainingTabContent } from "./TrainingTabContent";
import { UsersTabContent } from "./UsersTabContent";
import { SettingsTabContent } from "./SettingsTabContent";
import { useLocation, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

export function AdminPanelContent() {
  const [activeTab, setActiveTab] = useState("overview");
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Parse tab from URL or query parameter if present
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const tabParam = searchParams.get('tab');
    if (tabParam && ['overview', 'training', 'users', 'settings'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [location]);

  // Update URL when tab changes
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    const searchParams = new URLSearchParams(location.search);
    searchParams.set('tab', value);
    navigate(`${location.pathname}?${searchParams.toString()}`, { replace: true });
  };
  
  return (
    <Tabs defaultValue="overview" value={activeTab} onValueChange={handleTabChange} className="space-y-4">
      <TabsList className="grid grid-cols-4 max-w-[600px]">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="training">Training</TabsTrigger>
        <TabsTrigger value="users">Users</TabsTrigger>
        <TabsTrigger value="settings">Settings</TabsTrigger>
      </TabsList>
      
      <TabsContent value="overview" className="space-y-4">
        <OverviewTabContent />
      </TabsContent>
      
      <TabsContent value="training">
        <TrainingTabContent />
      </TabsContent>
      
      <TabsContent value="users">
        <UsersTabContent />
      </TabsContent>
      
      <TabsContent value="settings">
        <SettingsTabContent />
      </TabsContent>
    </Tabs>
  );
}
