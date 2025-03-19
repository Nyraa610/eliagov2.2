
import { Activity, AlertCircle, Lightbulb } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UseFormReturn } from "react-hook-form";
import { IROFormValues } from "./formSchema";
import { ImpactAssessmentForm } from "./ImpactAssessmentForm";
import { RiskAssessmentForm } from "./RiskAssessmentForm";
import { OpportunityAssessmentForm } from "./OpportunityAssessmentForm";

interface IROAnalysisTabsProps {
  form: UseFormReturn<IROFormValues>;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onSubmit: (values: IROFormValues) => void;
}

export function IROAnalysisTabs({ 
  form, 
  activeTab, 
  setActiveTab, 
  onSubmit 
}: IROAnalysisTabsProps) {
  const tabs = [
    { id: "impact", label: "Impact Assessment", icon: <Activity className="h-4 w-4 mr-2" /> },
    { id: "risks", label: "Risk Assessment", icon: <AlertCircle className="h-4 w-4 mr-2" /> },
    { id: "opportunities", label: "Opportunities", icon: <Lightbulb className="h-4 w-4 mr-2" /> }
  ];

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid grid-cols-3 mb-6">
        {tabs.map(tab => (
          <TabsTrigger key={tab.id} value={tab.id} className="flex items-center">
            {tab.icon} {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
      
      <TabsContent value="impact" className="space-y-4">
        <ImpactAssessmentForm 
          form={form} 
          onNext={() => setActiveTab("risks")} 
        />
      </TabsContent>
      
      <TabsContent value="risks" className="space-y-4">
        <RiskAssessmentForm 
          form={form} 
          onPrevious={() => setActiveTab("impact")} 
          onNext={() => setActiveTab("opportunities")} 
        />
      </TabsContent>
      
      <TabsContent value="opportunities" className="space-y-4">
        <OpportunityAssessmentForm 
          form={form} 
          onPrevious={() => setActiveTab("risks")} 
          onSubmit={onSubmit} 
        />
      </TabsContent>
    </Tabs>
  );
}
