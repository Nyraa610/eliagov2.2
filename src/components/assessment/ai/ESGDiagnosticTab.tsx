
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ESGAnalysis } from "@/components/ai/ESGAnalysis";
import { ESGAssessmentHistory } from "@/components/assessment/esg-diagnostic/ESGAssessmentHistory";
import { FileText, History } from "lucide-react";

export function ESGDiagnosticTab() {
  const [activeTab, setActiveTab] = useState("assessment");

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="assessment" className="flex items-center gap-1">
            <FileText className="h-4 w-4" /> ESG Diagnostic
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-1">
            <History className="h-4 w-4" /> Assessment History
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="assessment" className="pt-6">
          <ESGAnalysis />
        </TabsContent>
        
        <TabsContent value="history" className="pt-6">
          <ESGAssessmentHistory />
        </TabsContent>
      </Tabs>
    </div>
  );
}
