
import React, { createContext, useContext, useState } from "react";
import { ESGFormValues } from "../../esg-diagnostic/ESGFormSchema";
import { CompanyAnalysisResult } from "@/services/companyAnalysisService";

interface UnifiedAssessmentContextType {
  formData: ESGFormValues | null;
  setFormData: (data: ESGFormValues | ((prevData: ESGFormValues | null) => ESGFormValues)) => void;
  analysisResult: string | null;
  setAnalysisResult: (result: string) => void;
  showReport: boolean;
  setShowReport: (show: boolean) => void;
  companyInfo: CompanyAnalysisResult | null;
  setCompanyInfo: (info: CompanyAnalysisResult) => void;
  isLoadingCompanyInfo: boolean;
  setIsLoadingCompanyInfo: (isLoading: boolean) => void;
  handleStartNewAssessment: () => void;
}

const UnifiedAssessmentContext = createContext<UnifiedAssessmentContextType | undefined>(undefined);

export const UnifiedAssessmentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [formData, setFormData] = useState<ESGFormValues | null>(null);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [showReport, setShowReport] = useState(false);
  const [companyInfo, setCompanyInfo] = useState<CompanyAnalysisResult | null>(null);
  const [isLoadingCompanyInfo, setIsLoadingCompanyInfo] = useState(false);

  // Add the missing function for starting a new assessment
  const handleStartNewAssessment = () => {
    setShowReport(false);
    setFormData(null);
    setAnalysisResult(null);
  };

  return (
    <UnifiedAssessmentContext.Provider value={{
      formData,
      setFormData,
      analysisResult,
      setAnalysisResult,
      showReport,
      setShowReport,
      companyInfo,
      setCompanyInfo,
      isLoadingCompanyInfo,
      setIsLoadingCompanyInfo,
      handleStartNewAssessment
    }}>
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
