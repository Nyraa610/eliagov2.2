
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";
import { useUnifiedAssessment } from "../../../context/UnifiedAssessmentContext";
import { companyAnalysisService, CompanyAnalysisResult } from "@/services/companyAnalysisService";
import { ESGFormValues } from "@/components/assessment/esg-diagnostic/ESGFormSchema";

export function useCompanyAnalysis() {
  const { toast } = useToast();
  const { 
    companyInfo, 
    setCompanyInfo, 
    isLoadingCompanyInfo, 
    setIsLoadingCompanyInfo,
    setFormData
  } = useUnifiedAssessment();
  
  const [analyzingProgress, setAnalyzingProgress] = useState(0);
  const [userCompany, setUserCompany] = useState<string | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

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
            if (interval) clearInterval(interval);
            return 90;
          }
          return prev + Math.floor(Math.random() * 5 + 1); // More consistent progress
        });
      }, 800);
    } else if (companyInfo) {
      // Set to 100% when data is loaded
      setAnalyzingProgress(100);
      if (interval) clearInterval(interval);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isLoadingCompanyInfo, companyInfo]);
  
  // Fetch user's company when component mounts and automatically trigger analysis
  useEffect(() => {
    const getUserCompanyAndAnalyze = async () => {
      try {
        // Skip if we already have company info or are loading it
        if (companyInfo || isLoadingCompanyInfo) return;
        
        setIsLoadingCompanyInfo(true);
        const { data: sessionData } = await supabase.auth.getSession();
        
        if (sessionData.session) {
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*, companies:company_id(*)')
            .eq('id', sessionData.session.user.id)
            .single();
          
          if (profileError) {
            throw new Error(`Failed to fetch profile: ${profileError.message}`);
          }
          
          if (profileData?.companies?.name) {
            const companyName = profileData.companies.name;
            setUserCompany(companyName);
            
            // Automatically analyze the company
            await analyzeCompany(companyName);
          } else {
            setIsLoadingCompanyInfo(false);
            setAnalysisError("No company associated with your profile. Please contact your administrator.");
          }
        } else {
          setIsLoadingCompanyInfo(false);
          setAnalysisError("You need to be logged in to view company information.");
        }
      } catch (error) {
        console.error("Error fetching user company:", error);
        setIsLoadingCompanyInfo(false);
        setAnalysisError("Unable to retrieve your company information.");
      }
    };
    
    getUserCompanyAndAnalyze();
  }, []);
  
  const analyzeCompany = async (companyName: string) => {
    if (!companyName.trim()) {
      setIsLoadingCompanyInfo(false);
      setAnalysisError("Company name is required");
      return;
    }
    
    setAnalysisError(null);
    
    try {
      console.log(`Analyzing company: ${companyName}`);
      const result = await companyAnalysisService.getCompanyAnalysis(companyName);
      console.log("Analysis result:", result);
      
      setCompanyInfo(result);
      
      // Pre-fill form data with company information
      setFormData((prevData: ESGFormValues | null) => {
        return {
          ...(prevData || {}),
          companyName: companyName,
          industry: result.industry,
          employeeCount: result.employeeCount
        };
      });
      
      // Set progress to 100% when complete
      setAnalyzingProgress(100);
    } catch (error) {
      console.error("Error analyzing company:", error);
      setAnalysisError(error instanceof Error ? error.message : "Failed to analyze company information");
      toast({
        title: "Analysis failed",
        description: error instanceof Error ? error.message : "Failed to analyze company information",
        variant: "destructive"
      });
    } finally {
      setIsLoadingCompanyInfo(false);
    }
  };
  
  const handleRetryAnalysis = () => {
    if (userCompany) {
      setIsLoadingCompanyInfo(true);
      analyzeCompany(userCompany);
    }
  };

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
