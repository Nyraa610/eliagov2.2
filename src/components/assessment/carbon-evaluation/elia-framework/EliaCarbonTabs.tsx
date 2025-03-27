
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UseFormReturn } from "react-hook-form";
import { CarbonEvaluationFormValues } from "../formSchema";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Clipboard, Cog, FileText, Target, Users, Database, BarChart2 } from "lucide-react";
import { FramingForm } from "./FramingForm";
import { ScopingForm } from "./ScopingForm";
import { StakeholdersForm } from "./StakeholdersForm";
import { CarbonDataForm } from "./CarbonDataForm";
import { SynthesisForm } from "./SynthesisForm";
import { MethodologyForm } from "./MethodologyForm";

interface EliaCarbonTabsProps {
  form: UseFormReturn<CarbonEvaluationFormValues>;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onSubmit: (values: CarbonEvaluationFormValues) => void;
  onBackToFrameworkSelection?: () => void;
}

export function EliaCarbonTabs({
  form,
  activeTab,
  setActiveTab,
  onSubmit,
  onBackToFrameworkSelection,
}: EliaCarbonTabsProps) {
  const tabs = [
    { id: "framing", label: "Framing", icon: <Target className="h-4 w-4 mr-2" /> },
    { id: "scoping", label: "Scoping", icon: <Cog className="h-4 w-4 mr-2" /> },
    { id: "stakeholders", label: "Stakeholders", icon: <Users className="h-4 w-4 mr-2" /> },
    { id: "carbon-data", label: "Carbon Data", icon: <Database className="h-4 w-4 mr-2" /> },
    { id: "synthesis", label: "Synthesis", icon: <BarChart2 className="h-4 w-4 mr-2" /> },
    { id: "methodology", label: "Methodology", icon: <Clipboard className="h-4 w-4 mr-2" /> },
  ];

  return (
    <>
      {onBackToFrameworkSelection && (
        <Button
          variant="ghost"
          size="sm"
          className="mb-4 flex items-center gap-1"
          onClick={onBackToFrameworkSelection}
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Framework Selection
        </Button>
      )}

      <div className="mb-4 p-3 bg-primary/5 border border-primary/20 rounded-md">
        <p className="text-sm font-medium text-primary">
          Framework: Elia Carbon Evaluation (simplified Bilan Carbone)
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 mb-6">
          {tabs.map((tab) => (
            <TabsTrigger key={tab.id} value={tab.id} className="flex items-center">
              {tab.icon} {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="framing" className="space-y-4">
          <FramingForm
            form={form}
            onNext={() => setActiveTab("scoping")}
          />
        </TabsContent>

        <TabsContent value="scoping" className="space-y-4">
          <ScopingForm
            form={form}
            onPrevious={() => setActiveTab("framing")}
            onNext={() => setActiveTab("stakeholders")}
          />
        </TabsContent>

        <TabsContent value="stakeholders" className="space-y-4">
          <StakeholdersForm
            form={form}
            onPrevious={() => setActiveTab("scoping")}
            onNext={() => setActiveTab("carbon-data")}
          />
        </TabsContent>

        <TabsContent value="carbon-data" className="space-y-4">
          <CarbonDataForm
            form={form}
            onPrevious={() => setActiveTab("stakeholders")}
            onNext={() => setActiveTab("synthesis")}
          />
        </TabsContent>

        <TabsContent value="synthesis" className="space-y-4">
          <SynthesisForm
            form={form}
            onPrevious={() => setActiveTab("carbon-data")}
            onNext={() => setActiveTab("methodology")}
          />
        </TabsContent>

        <TabsContent value="methodology" className="space-y-4">
          <MethodologyForm
            form={form}
            onPrevious={() => setActiveTab("synthesis")}
            onSubmit={onSubmit}
          />
        </TabsContent>
      </Tabs>
    </>
  );
}
