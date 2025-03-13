
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ESGAnalysis } from "@/components/ai/ESGAnalysis";
import { ESGDiagnosticTab } from "./ESGDiagnosticTab";
import { BarChart, FileSpreadsheet } from "lucide-react";

export function AIAssessmentTab() {
  const [activeTab, setActiveTab] = useState("esg-diagnostic");

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="esg-diagnostic" className="flex items-center gap-1">
            <FileSpreadsheet className="h-4 w-4" /> ESG Diagnostic
          </TabsTrigger>
          <TabsTrigger value="data-visualization" className="flex items-center gap-1">
            <BarChart className="h-4 w-4" /> Data Visualization
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="esg-diagnostic" className="pt-6">
          <ESGDiagnosticTab />
        </TabsContent>
        
        <TabsContent value="data-visualization" className="pt-6">
          <div className="text-center py-10 text-muted-foreground">
            <BarChart className="h-12 w-12 mx-auto mb-4 opacity-20" />
            <p>Data visualization tools coming soon!</p>
            <p className="text-sm mt-2">This feature will help you visualize and track your ESG progress over time.</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
