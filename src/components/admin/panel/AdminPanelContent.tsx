
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OverviewTabContent } from "./OverviewTabContent";
import { TrainingTabContent } from "./TrainingTabContent";
import { UsersTabContent } from "./UsersTabContent";
import { SettingsTabContent } from "./SettingsTabContent";

export function AdminPanelContent() {
  const [activeTab, setActiveTab] = useState("overview");
  
  return (
    <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
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
