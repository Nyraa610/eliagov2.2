
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles } from "lucide-react";
import { ESGFormValues } from "../esg-diagnostic/ESGFormSchema";
import { UnifiedAssessmentProvider, useUnifiedAssessment } from "./context/UnifiedAssessmentContext";
import { UnifiedAssessmentForm } from "./components/UnifiedAssessmentForm";
import { UnifiedAssessmentReport } from "./components/UnifiedAssessmentReport";
import { CompanyOverview } from "./components/company-overview";

const UnifiedESGAnalysisContent = () => {
  const { formData, analysisResult, showReport, companyInfo } = useUnifiedAssessment();
  const [showAssessmentForm, setShowAssessmentForm] = useState(false);

  const handleFormSubmit = (values: ESGFormValues) => {
    // This is handled in the UnifiedAssessmentForm component
    console.log("Form submitted:", values);
  };

  const handleFormAnalysisComplete = (result: string) => {
    // This is handled in the UnifiedAssessmentForm component
    console.log("Analysis complete:", result);
  };

  const handleContinueToAssessment = () => {
    setShowAssessmentForm(true);
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
            !showAssessmentForm ? (
              <CompanyOverview onContinue={handleContinueToAssessment} />
            ) : (
              <UnifiedAssessmentForm 
                onSubmit={handleFormSubmit}
                onAnalysisComplete={handleFormAnalysisComplete}
              />
            )
          ) : (
            formData && analysisResult && (
              <UnifiedAssessmentReport 
                formData={formData}
                analysisResult={analysisResult}
              />
            )
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export function UnifiedESGAnalysis() {
  return (
    <UnifiedAssessmentProvider>
      <UnifiedESGAnalysisContent />
    </UnifiedAssessmentProvider>
  );
}
