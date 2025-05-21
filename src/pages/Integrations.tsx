
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate, useParams } from "react-router-dom";
import NotionIntegration from "@/components/integrations/notion/NotionIntegration";
import ActionPlanExport from "@/components/integrations/notion/ActionPlanExport";

export default function Integrations() {
  const navigate = useNavigate();
  const { integrationTab } = useParams();
  const [activeTab, setActiveTab] = useState<string>(integrationTab || "notion");

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    navigate(`/integrations/${value}`);
  };

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
