
import React from "react";
import { UnifiedDiagnosticForm } from "../UnifiedDiagnosticForm";
import { ESGFormValues } from "../../esg-diagnostic/ESGFormSchema";
import { useUnifiedAssessment } from "../context/UnifiedAssessmentContext";

interface UnifiedAssessmentFormProps {
  onSubmit: (values: ESGFormValues) => void;
  onAnalysisComplete: (analysisResult: string) => void;
}

export const UnifiedAssessmentForm: React.FC<UnifiedAssessmentFormProps> = ({ 
  onSubmit, 
  onAnalysisComplete 
}) => {
  const { setFormData, setAnalysisResult, setShowReport } = useUnifiedAssessment();

  const handleFormSubmit = (values: ESGFormValues) => {
    setFormData(values);
    onSubmit(values);
  };

  const handleFormAnalysisComplete = (result: string) => {
    setAnalysisResult(result);
    setShowReport(true);
    onAnalysisComplete(result);
  };

  return (
    <UnifiedDiagnosticForm 
      onSubmit={handleFormSubmit}
      onAnalysisComplete={handleFormAnalysisComplete}
    />
  );
};
