
import React, { createContext, useContext, useState } from "react";
import { ESGFormValues } from "../../esg-diagnostic/ESGFormSchema";

interface UnifiedAssessmentContextType {
  formData: ESGFormValues | null;
  analysisResult: string | null;
  showReport: boolean;
  setFormData: (data: ESGFormValues | null) => void;
  setAnalysisResult: (result: string | null) => void;
  setShowReport: (show: boolean) => void;
  handleStartNewAssessment: () => void;
}

const UnifiedAssessmentContext = createContext<UnifiedAssessmentContextType | undefined>(undefined);

export const UnifiedAssessmentProvider = ({ children }: { children: React.ReactNode }) => {
  const [formData, setFormData] = useState<ESGFormValues | null>(null);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [showReport, setShowReport] = useState(false);

  const handleStartNewAssessment = () => {
    setShowReport(false);
    setFormData(null);
    setAnalysisResult(null);
  };

  return (
    <UnifiedAssessmentContext.Provider 
      value={{
        formData,
        analysisResult,
        showReport,
        setFormData,
        setAnalysisResult,
        setShowReport,
        handleStartNewAssessment
      }}
    >
      {children}
    </UnifiedAssessmentContext.Provider>
  );
};

export const useUnifiedAssessment = () => {
  const context = useContext(UnifiedAssessmentContext);
  if (context === undefined) {
    throw new Error("useUnifiedAssessment must be used within a UnifiedAssessmentProvider");
  }
  return context;
};
