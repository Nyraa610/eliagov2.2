
import { Layers, Users, BarChart3, TrendingUp } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UseFormReturn } from "react-hook-form";
import { MaterialityFormValues } from "./formSchema";
import { DoubleMaterialityIntro } from "./DoubleMaterialityIntro";
import { AIMaterialityIssues } from "./AIMaterialityIssues";
import { StakeholderInputForm } from "./StakeholderInputForm";
import { MaterialityMatrix } from "./MaterialityMatrix";

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
    { id: "introduction", label: "Introduction", icon: <Layers className="h-4 w-4 mr-2" /> },
    { id: "identify", label: "Identify Issues", icon: <BarChart3 className="h-4 w-4 mr-2" /> },
    { id: "stakeholders", label: "Stakeholder Input", icon: <Users className="h-4 w-4 mr-2" /> },
    { id: "matrix", label: "Materiality Matrix", icon: <TrendingUp className="h-4 w-4 mr-2" /> }
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
      
      <TabsContent value="introduction" className="space-y-4">
        <DoubleMaterialityIntro />
        <div className="flex justify-end">
          <button 
            onClick={() => setActiveTab("identify")} 
            className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90"
          >
            Start Assessment
          </button>
        </div>
      </TabsContent>
      
      <TabsContent value="identify" className="space-y-4">
        <AIMaterialityIssues 
          form={form} 
          onNext={() => setActiveTab("stakeholders")} 
        />
      </TabsContent>
      
      <TabsContent value="stakeholders" className="space-y-4">
        <StakeholderInputForm 
          form={form} 
          onPrevious={() => setActiveTab("identify")} 
          onNext={() => setActiveTab("matrix")} 
        />
      </TabsContent>
      
      <TabsContent value="matrix" className="space-y-4">
        <MaterialityMatrix 
          form={form} 
          onPrevious={() => setActiveTab("stakeholders")} 
          onFinish={onSubmit} 
        />
      </TabsContent>
    </Tabs>
  );
}
