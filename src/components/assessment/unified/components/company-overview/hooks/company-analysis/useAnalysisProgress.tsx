
import { useState, useEffect } from "react";
import { CompanyAnalysisResult } from "@/services/companyAnalysisService";

export function useAnalysisProgress(
  isLoadingCompanyInfo: boolean,
  companyInfo: CompanyAnalysisResult | null
) {
  const [analyzingProgress, setAnalyzingProgress] = useState(0);

  // Function to simulate progress while waiting for the API
  useEffect(() => {
    let interval: number | null = null;
    
    if (isLoadingCompanyInfo && !companyInfo) {
      // Reset progress at the start
      setAnalyzingProgress(5);
      
      // Simulate progress to 90% (reserve the last 10% for actual data loading)
      interval = window.setInterval(() => {
        setAnalyzingProgress(prev => {
          if (prev >= 90) {
            return 90;
          }
          return prev + Math.floor(Math.random() * 5 + 1); // More consistent progress
        });
      }, 800);
    } else if (companyInfo) {
      // Set to 100% when data is loaded
      setAnalyzingProgress(100);
    }
    
    return () => {
      if (interval) window.clearInterval(interval);
    };
  }, [isLoadingCompanyInfo, companyInfo]);

  return { analyzingProgress };
}
