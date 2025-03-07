
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Target, Lightbulb, CalendarClock, Check } from "lucide-react";
import { GoalsForm } from "./GoalsForm";
import { InitiativesForm } from "./InitiativesForm";
import { TimelineForm } from "./TimelineForm";
import { ReviewForm } from "./ReviewForm";
import { UseFormReturn } from "react-hook-form";
import { ActionPlanFormValues } from "./formSchema";

interface ActionPlanTabsProps {
  form: UseFormReturn<ActionPlanFormValues>;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onSubmit: (values: ActionPlanFormValues) => void;
}

export function ActionPlanTabs({ 
  form, 
  activeTab, 
  setActiveTab, 
  onSubmit 
}: ActionPlanTabsProps) {
  const tabs = [
    { id: "goals", label: "ESG Goals", icon: <Target className="h-4 w-4 mr-2" /> },
    { id: "initiatives", label: "Key Initiatives", icon: <Lightbulb className="h-4 w-4 mr-2" /> },
    { id: "timeline", label: "Timeline", icon: <CalendarClock className="h-4 w-4 mr-2" /> },
    { id: "review", label: "Review & Submit", icon: <Check className="h-4 w-4 mr-2" /> }
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
      
      <TabsContent value="goals" className="space-y-4">
        <GoalsForm 
          form={form} 
          onNext={() => setActiveTab("initiatives")} 
        />
      </TabsContent>
      
      <TabsContent value="initiatives" className="space-y-4">
        <InitiativesForm 
          form={form} 
          onPrevious={() => setActiveTab("goals")} 
          onNext={() => setActiveTab("timeline")} 
        />
      </TabsContent>
      
      <TabsContent value="timeline" className="space-y-4">
        <TimelineForm 
          form={form} 
          onPrevious={() => setActiveTab("initiatives")} 
          onNext={() => setActiveTab("review")} 
        />
      </TabsContent>
      
      <TabsContent value="review" className="space-y-4">
        <ReviewForm 
          form={form} 
          onPrevious={() => setActiveTab("timeline")} 
          onSubmit={onSubmit} 
        />
      </TabsContent>
    </Tabs>
  );
}
