
import { Building, Car, Factory, Leaf } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UseFormReturn } from "react-hook-form";
import { CarbonEvaluationFormValues } from "./formSchema";
import { CompanyInfoForm } from "./CompanyInfoForm";
import { DirectEmissionsForm } from "./DirectEmissionsForm";
import { IndirectEmissionsForm } from "./IndirectEmissionsForm";
import { TransportationForm } from "./TransportationForm";

interface CarbonEvaluationTabsProps {
  form: UseFormReturn<CarbonEvaluationFormValues>;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onSubmit: (values: CarbonEvaluationFormValues) => void;
}

export function CarbonEvaluationTabs({ 
  form, 
  activeTab, 
  setActiveTab, 
  onSubmit 
}: CarbonEvaluationTabsProps) {
  const tabs = [
    { id: "company-info", label: "Company Information", icon: <Building className="h-4 w-4 mr-2" /> },
    { id: "direct-emissions", label: "Direct Emissions", icon: <Factory className="h-4 w-4 mr-2" /> },
    { id: "indirect-emissions", label: "Indirect Emissions", icon: <Leaf className="h-4 w-4 mr-2" /> },
    { id: "transportation", label: "Transportation", icon: <Car className="h-4 w-4 mr-2" /> }
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
      
      <TabsContent value="company-info" className="space-y-4">
        <CompanyInfoForm 
          form={form} 
          onNext={() => setActiveTab("direct-emissions")} 
        />
      </TabsContent>
      
      <TabsContent value="direct-emissions" className="space-y-4">
        <DirectEmissionsForm 
          form={form} 
          onPrevious={() => setActiveTab("company-info")} 
          onNext={() => setActiveTab("indirect-emissions")} 
        />
      </TabsContent>
      
      <TabsContent value="indirect-emissions" className="space-y-4">
        <IndirectEmissionsForm 
          form={form} 
          onPrevious={() => setActiveTab("direct-emissions")} 
          onNext={() => setActiveTab("transportation")} 
        />
      </TabsContent>
      
      <TabsContent value="transportation" className="space-y-4">
        <TransportationForm 
          form={form} 
          onPrevious={() => setActiveTab("indirect-emissions")} 
          onSubmit={onSubmit} 
        />
      </TabsContent>
    </Tabs>
  );
}
