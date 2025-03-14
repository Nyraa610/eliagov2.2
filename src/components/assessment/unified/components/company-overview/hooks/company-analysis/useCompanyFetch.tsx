import { useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";
import { companyAnalysisService, CompanyAnalysisResult } from "@/services/companyAnalysisService";
import { useUnifiedAssessment } from "../../../../context/UnifiedAssessmentContext";
import { ESGFormValues } from "@/components/assessment/esg-diagnostic/ESGFormSchema";

interface UseCompanyFetchProps {
  userCompany: string | null;
  setUserCompany: (company: string | null) => void;
  setCompanyInfo: (info: CompanyAnalysisResult) => void;
  setIsLoadingCompanyInfo: (isLoading: boolean) => void;
  setAnalysisError: (error: string | null) => void;
}

export function useCompanyFetch({
  userCompany,
  setUserCompany,
  setCompanyInfo,
  setIsLoadingCompanyInfo,
  setAnalysisError
}: UseCompanyFetchProps) {
  const { toast } = useToast();
  const { setFormData } = useUnifiedAssessment();

  useEffect(() => {
    const getUserCompanyAndAnalyze = async () => {
      try {
        if (userCompany) return;
        
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
        
        await analyzeCompany(companyName);
      } catch (error) {
        console.error("Error in getUserCompanyAndAnalyze:", error);
        
        const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
        setIsLoadingCompanyInfo(false);
        setAnalysisError(errorMessage);
        
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
  }, [userCompany, setUserCompany, setCompanyInfo, setIsLoadingCompanyInfo, setAnalysisError, toast]);
  
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
      
      setFormData((prevData: ESGFormValues | null) => {
        return {
          ...(prevData || {}),
          companyName: companyName,
          industry: result.industry,
          employeeCount: result.employeeCount
        };
      });
      
      toast({
        title: "Analysis Complete",
        description: "Company information has been successfully analyzed",
      });
    } catch (error) {
      console.error("Error analyzing company:", error);
      
      let errorMessage = "An unexpected error occurred during company analysis";
      let errorTitle = "Analysis Failed";
      
      if (error instanceof Error) {
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
    analyzeCompany,
    handleRetryAnalysis
  };
}
