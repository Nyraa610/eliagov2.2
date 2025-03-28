
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OverviewTabContent } from "./OverviewTabContent";
import { TrainingTabContent } from "./TrainingTabContent";
import { UsersTabContent } from "./UsersTabContent";
import { SettingsTabContent } from "./SettingsTabContent";
import { Settings, Book, Users } from "lucide-react";

export function AdminPanelContent() {
  return (
    <Tabs defaultValue="overview" className="space-y-4">
      <TabsList>
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
