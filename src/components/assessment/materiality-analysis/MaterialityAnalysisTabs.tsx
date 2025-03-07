
import { Layers, Users, TrendingUp, BarChart3 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UseFormReturn } from "react-hook-form";
import { MaterialityFormValues } from "./formSchema";
import { IdentifyIssuesForm } from "./IdentifyIssuesForm";
import { AssessImpactForm } from "./AssessImpactForm";
import { StakeholderInputForm } from "./StakeholderInputForm";
import { PrioritizeForm } from "./PrioritizeForm";

interface MaterialityAnalysisTabsProps {
  form: UseFormReturn<MaterialityFormValues>;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onSubmit: (values: MaterialityFormValues) => void;
}

export function MaterialityAnalysisTabs({ 
  form, 
  activeTab, 
  setActiveTab, 
  onSubmit 
}: MaterialityAnalysisTabsProps) {
  const tabs = [
    { id: "identify", label: "Identify Issues", icon: <Layers className="h-4 w-4 mr-2" /> },
    { id: "assess", label: "Assess Impact", icon: <BarChart3 className="h-4 w-4 mr-2" /> },
    { id: "stakeholders", label: "Stakeholder Input", icon: <Users className="h-4 w-4 mr-2" /> },
    { id: "prioritize", label: "Prioritize", icon: <TrendingUp className="h-4 w-4 mr-2" /> }
  ];

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid grid-cols-2 lg:grid-cols-4 mb-6">
        {tabs.map(tab => (
          <TabsTrigger key={tab.id} value={tab.id} className="flex items-center">
            {tab.icon} {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
      
      <TabsContent value="identify" className="space-y-4">
        <IdentifyIssuesForm 
          form={form} 
          onNext={() => setActiveTab("assess")} 
        />
      </TabsContent>
      
      <TabsContent value="assess" className="space-y-4">
        <AssessImpactForm 
          form={form} 
          onPrevious={() => setActiveTab("identify")} 
          onNext={() => setActiveTab("stakeholders")} 
        />
      </TabsContent>
      
      <TabsContent value="stakeholders" className="space-y-4">
        <StakeholderInputForm 
          form={form} 
          onPrevious={() => setActiveTab("assess")} 
          onNext={() => setActiveTab("prioritize")} 
        />
      </TabsContent>
      
      <TabsContent value="prioritize" className="space-y-4">
        <PrioritizeForm 
          form={form} 
          onPrevious={() => setActiveTab("stakeholders")} 
          onSubmit={onSubmit} 
        />
      </TabsContent>
    </Tabs>
  );
}
