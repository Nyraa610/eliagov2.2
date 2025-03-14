
import { useCompanyFetch } from './company-analysis/useCompanyFetch';
import { useCompanyAnalysisState } from './company-analysis/useCompanyAnalysisState';
import { useAnalysisProgress } from './company-analysis/useAnalysisProgress';

export function useCompanyAnalysis() {
  const {
    userCompany,
    setUserCompany,
    companyInfo,
    isLoadingCompanyInfo,
    analysisError,
    setAnalysisError,
    setIsLoadingCompanyInfo,
    setCompanyInfo
  } = useCompanyAnalysisState();

  const { analyzingProgress } = useAnalysisProgress(isLoadingCompanyInfo, companyInfo);
  
  const { 
    handleRetryAnalysis,
    analyzeCompany
  } = useCompanyFetch({
    userCompany,
    setUserCompany,
    setCompanyInfo,
    setIsLoadingCompanyInfo,
    setAnalysisError
  });

  return {
    companyInfo,
    userCompany,
    analyzingProgress,
    isLoadingCompanyInfo,
    analysisError,
    handleRetryAnalysis,
    analyzeCompany
  };
}
