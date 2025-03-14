
import React from "react";
import { ESGDiagnosticReport } from "../../esg-diagnostic/ESGDiagnosticReport";
import { ESGFormValues } from "../../esg-diagnostic/ESGFormSchema";
import { useUnifiedAssessment } from "../context/UnifiedAssessmentContext";

interface UnifiedAssessmentReportProps {
  formData: ESGFormValues;
  analysisResult: string;
}

export const UnifiedAssessmentReport: React.FC<UnifiedAssessmentReportProps> = ({ 
  formData, 
  analysisResult 
}) => {
  const { handleStartNewAssessment } = useUnifiedAssessment();

  return (
    <ESGDiagnosticReport 
      formData={formData}
      analysisResult={analysisResult}
      onStartNew={handleStartNewAssessment}
    />
  );
};
