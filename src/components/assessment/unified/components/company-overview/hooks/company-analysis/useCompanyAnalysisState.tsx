
import { useState } from "react";
import { useUnifiedAssessment } from "../../../../context/UnifiedAssessmentContext";
import { CompanyAnalysisResult } from "@/services/companyAnalysisService";

export function useCompanyAnalysisState() {
  const { 
    companyInfo, 
    setCompanyInfo, 
    isLoadingCompanyInfo, 
    setIsLoadingCompanyInfo,
  } = useUnifiedAssessment();
  
  const [userCompany, setUserCompany] = useState<string | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  return {
    companyInfo,
    setCompanyInfo,
    isLoadingCompanyInfo,
    setIsLoadingCompanyInfo,
    userCompany,
    setUserCompany,
    analysisError,
    setAnalysisError
  };
}
