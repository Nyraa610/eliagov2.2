
import { useState, useEffect, useRef } from "react";
import { CompanyAnalysisResult } from "@/services/companyAnalysisService";

export function useAnalysisProgress(
  isLoadingCompanyInfo: boolean,
  companyInfo: CompanyAnalysisResult | null
) {
  const [analyzingProgress, setAnalyzingProgress] = useState(0);
  const intervalRef = useRef<number | null>(null);

  // Function to simulate progress while waiting for the API
  useEffect(() => {
    // Clear any existing interval to prevent multiple intervals running
    if (intervalRef.current !== null) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    if (isLoadingCompanyInfo && !companyInfo) {
      // Reset progress at the start
      setAnalyzingProgress(5);
      
      // Simulate progress to 90% (reserve the last 10% for actual data loading)
      const id = window.setInterval(() => {
        setAnalyzingProgress(prev => {
          if (prev >= 90) {
            return 90;
          }
          return prev + Math.floor(Math.random() * 5 + 1); // More consistent progress
        });
      }, 800);
      
      intervalRef.current = id;
    } else if (companyInfo) {
      // Set to 100% when data is loaded
      setAnalyzingProgress(100);
    }
    
    // Cleanup function to clear interval when component unmounts or dependencies change
    return () => {
      if (intervalRef.current !== null) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isLoadingCompanyInfo, companyInfo]);

  return { analyzingProgress };
}
