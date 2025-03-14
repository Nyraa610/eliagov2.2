
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Sparkles, HelpCircle, FileCheck } from "lucide-react";
import { UnifiedDiagnosticForm } from "./UnifiedDiagnosticForm";
import { ESGDiagnosticReport } from "../esg-diagnostic/ESGDiagnosticReport";
import { ESGFormValues } from "../esg-diagnostic/ESGFormSchema";

export function UnifiedESGAnalysis() {
  const [formData, setFormData] = useState<ESGFormValues | null>(null);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [showReport, setShowReport] = useState(false);
  const { toast } = useToast();

  const handleFormSubmit = (values: ESGFormValues) => {
    setFormData(values);
  };

  const handleFormAnalysisComplete = (result: string) => {
    setAnalysisResult(result);
    setShowReport(true);
  };

  const handleStartNewAssessment = () => {
    setShowReport(false);
    setFormData(null);
    setAnalysisResult(null);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" /> Unified ESG/RSE Assessment
          </CardTitle>
          <CardDescription>
            Complete this assessment to evaluate your company's sustainability practices with guidance from Elia
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!showReport ? (
            <UnifiedDiagnosticForm 
              onSubmit={handleFormSubmit}
              onAnalysisComplete={handleFormAnalysisComplete}
            />
          ) : (
            formData && analysisResult && (
              <ESGDiagnosticReport 
                formData={formData}
                analysisResult={analysisResult}
                onStartNew={handleStartNewAssessment}
              />
            )
          )}
        </CardContent>
      </Card>
    </div>
  );
}
