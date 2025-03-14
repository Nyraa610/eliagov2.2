
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
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          throw new Error(`Authentication error: ${sessionError.message}`);
        }
        
        if (!sessionData.session) {
          throw new Error("No active session found. Please log in to continue.");
        }
        
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*, companies:company_id(*)')
          .eq('id', sessionData.session.user.id)
          .single();
        
        if (profileError) {
          throw new Error(`Failed to fetch user profile: ${profileError.message}`);
        }
        
        if (!profileData) {
          throw new Error("User profile data not found. Please complete your profile setup.");
        }
        
        if (!profileData.companies?.name) {
          setIsLoadingCompanyInfo(false);
          setAnalysisError("No company associated with your profile. Please join or create a company in your profile settings.");
          toast({
            title: "Company Information Missing",
            description: "No company is associated with your profile. Please join or create a company.",
            variant: "destructive"
          });
          return;
        }
        
        const companyName = profileData.companies.name;
        setUserCompany(companyName);
        
        // Automatically analyze the company
        await analyzeCompany(companyName);
      } catch (error) {
        console.error("Error in getUserCompanyAndAnalyze:", error);
        
        const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
        setIsLoadingCompanyInfo(false);
        setAnalysisError(errorMessage);
        
        // Display appropriate toast based on error type
        if (errorMessage.includes("Authentication")) {
          toast({
            title: "Authentication Error",
            description: "Please log in again to continue.",
            variant: "destructive"
          });
        } else if (errorMessage.includes("profile")) {
          toast({
            title: "Profile Error",
            description: errorMessage,
            variant: "destructive"
          });
        } else {
          toast({
            title: "Error",
            description: "Unable to retrieve your company information. Please try again later.",
            variant: "destructive"
          });
        }
      }
    };
    
    getUserCompanyAndAnalyze();
  }, []);
  
  const analyzeCompany = async (companyName: string) => {
    if (!companyName.trim()) {
      setIsLoadingCompanyInfo(false);
      setAnalysisError("Company name is required");
      toast({
        title: "Missing Information",
        description: "Company name is required for analysis",
        variant: "destructive"
      });
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
      
      toast({
        title: "Analysis Complete",
        description: "Company information has been successfully analyzed",
      });
    } catch (error) {
      console.error("Error analyzing company:", error);
      
      // Enhanced error handling with specific error types
      let errorMessage = "An unexpected error occurred during company analysis";
      let errorTitle = "Analysis Failed";
      
      if (error instanceof Error) {
        // Parse different error types for more specific messages
        const errorText = error.message;
        
        if (errorText.includes("Edge function error")) {
          errorMessage = "The analysis service is currently unavailable. Please try again later.";
          errorTitle = "Service Unavailable";
        } else if (errorText.includes("Invalid response format")) {
          errorMessage = "The analysis service returned an invalid response. Our team has been notified.";
          errorTitle = "Data Error";
        } else if (errorText.includes("OpenAI API error")) {
          errorMessage = "The AI analysis engine encountered an issue. Please try again in a few minutes.";
          errorTitle = "AI Service Error";
        } else if (errorText.includes("Failed to analyze company")) {
          // Use the specific error message as provided
          errorMessage = errorText;
        }
      }
      
      setAnalysisError(errorMessage);
      
      toast({
        title: errorTitle,
        description: errorMessage,
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
    } else {
      toast({
        title: "Retry Failed",
        description: "Cannot retry analysis: Company name is missing",
        variant: "destructive"
      });
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
