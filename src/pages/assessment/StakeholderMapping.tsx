
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StakeholderIdentification } from "@/components/assessment/stakeholder-mapping/StakeholderIdentification";
import { StakeholderManagement } from "@/components/assessment/stakeholder-mapping/StakeholderManagement";
import { StakeholderVisualMap } from "@/components/assessment/stakeholder-mapping/StakeholderVisualMap";
import { StakeholderDatabase } from "@/components/assessment/stakeholder-mapping/StakeholderDatabase";
import { StakeholderSurveys } from "@/components/assessment/stakeholder-mapping/StakeholderSurveys";
import { HotjarTracking } from "@/components/analytics/HotjarTracking";

export default function StakeholderMapping() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("identification");

  return (
    <>
      <HotjarTracking />
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-primary mb-2">Stakeholder Mapping</h1>
        <p className="text-gray-600">
          Map and manage your company's stakeholders to improve engagement and sustainability performance.
        </p>
      </div>

      <Tabs defaultValue="identification" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-5 mb-8">
          <TabsTrigger value="identification">Identification</TabsTrigger>
          <TabsTrigger value="management">Management</TabsTrigger>
          <TabsTrigger value="visualmap">Visual Map</TabsTrigger>
          <TabsTrigger value="database">Database</TabsTrigger>
          <TabsTrigger value="surveys">Surveys</TabsTrigger>
        </TabsList>

        <TabsContent value="identification">
          <StakeholderIdentification onComplete={() => setActiveTab("management")} />
        </TabsContent>
        
        <TabsContent value="management">
          <StakeholderManagement onComplete={() => setActiveTab("visualmap")} />
        </TabsContent>
        
        <TabsContent value="visualmap">
          <StakeholderVisualMap onComplete={() => setActiveTab("database")} />
        </TabsContent>
        
        <TabsContent value="database">
          <StakeholderDatabase onComplete={() => setActiveTab("surveys")} />
        </TabsContent>
        
        <TabsContent value="surveys">
          <StakeholderSurveys />
        </TabsContent>
      </Tabs>
    </>
  );
}
