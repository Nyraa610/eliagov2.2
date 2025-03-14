
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ESGAssessmentHistory } from "@/components/assessment/esg-diagnostic/ESGAssessmentHistory";
import { FileText, History, MessagesSquare } from "lucide-react";
import { UnifiedESGAnalysis } from "@/components/assessment/unified/UnifiedESGAnalysis";
import { EliaAssistant } from "@/components/assessment/unified/EliaAssistant";

export function ESGDiagnosticTab() {
  const [activeTab, setActiveTab] = useState("assessment");

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="assessment" className="flex items-center gap-1">
            <FileText className="h-4 w-4" /> Assessment
          </TabsTrigger>
          <TabsTrigger value="ai-assistant" className="flex items-center gap-1">
            <MessagesSquare className="h-4 w-4" /> Elia Assistant
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-1">
            <History className="h-4 w-4" /> History
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="assessment" className="pt-6">
          <UnifiedESGAnalysis />
        </TabsContent>
        
        <TabsContent value="ai-assistant" className="pt-6">
          <EliaAssistant />
        </TabsContent>
        
        <TabsContent value="history" className="pt-6">
          <ESGAssessmentHistory />
        </TabsContent>
      </Tabs>
    </div>
  );
}
