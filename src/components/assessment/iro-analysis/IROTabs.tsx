
import { Settings, TrendingDown, TrendingUp, Check } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UseFormReturn } from "react-hook-form";
import { IROFormValues } from "./formSchema";
import { MethodologyForm } from "./MethodologyForm";
import { AnalysisForm } from "./AnalysisForm";
import { ReviewForm } from "./ReviewForm";
import { FeatureStatus } from "@/types/training";

interface IROTabsProps {
  form: UseFormReturn<IROFormValues>;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onSubmit: (values: IROFormValues) => void;
  analysisStatus: FeatureStatus;
}

export function IROTabs({ 
  form, 
  activeTab, 
  setActiveTab, 
  onSubmit,
  analysisStatus
}: IROTabsProps) {
  const tabs = [
    { id: "methodology", label: "Methodology", icon: <Settings className="h-4 w-4 mr-2" /> },
    { id: "analysis", label: "Analysis", icon: <TrendingDown className="h-4 w-4 mr-2" /> },
    { id: "review", label: "Review", icon: <Check className="h-4 w-4 mr-2" /> }
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
      
      <TabsContent value="methodology" className="space-y-4">
        <MethodologyForm 
          form={form} 
          onNext={() => setActiveTab("analysis")} 
        />
      </TabsContent>
      
      <TabsContent value="analysis" className="space-y-4">
        <AnalysisForm 
          form={form} 
          onPrevious={() => setActiveTab("methodology")} 
          onNext={() => setActiveTab("review")}
          analysisStatus={analysisStatus}
        />
      </TabsContent>
      
      <TabsContent value="review" className="space-y-4">
        <ReviewForm 
          form={form} 
          onPrevious={() => setActiveTab("analysis")} 
          onSubmit={onSubmit} 
        />
      </TabsContent>
    </Tabs>
  );
}
