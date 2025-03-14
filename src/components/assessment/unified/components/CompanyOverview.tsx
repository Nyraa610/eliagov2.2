
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Building2, CalendarDays, Info, MapPin, Users, Loader2 } from "lucide-react";
import { useUnifiedAssessment } from "../context/UnifiedAssessmentContext";
import { companyAnalysisService } from "@/services/companyAnalysisService";
import { Skeleton } from "@/components/ui/skeleton";
import { ESGFormValues } from "../../esg-diagnostic/ESGFormSchema";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/lib/supabase";

interface CompanyOverviewProps {
  onContinue: () => void;
}

export function CompanyOverview({ onContinue }: CompanyOverviewProps) {
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
          return prev + Math.floor(Math.random() * 10);
        });
      }, 1000);
    } else if (companyInfo) {
      // Set to 100% when data is loaded
      setAnalyzingProgress(100);
      if (interval) clearInterval(interval);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isLoadingCompanyInfo, companyInfo]);
  
  // Fetch user's company when component mounts
  useEffect(() => {
    const getUserCompany = async () => {
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        
        if (sessionData.session) {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('*, companies:company_id(*)')
            .eq('id', sessionData.session.user.id)
            .single();
          
          if (profileData?.companies?.name) {
            const companyName = profileData.companies.name;
            setUserCompany(companyName);
            
            // Automatically analyze the company if we have a name
            handleAnalyzeCompany(companyName);
          } else {
            setAnalysisError("No company associated with your profile. Please contact your administrator.");
          }
        }
      } catch (error) {
        console.error("Error fetching user company:", error);
        setAnalysisError("Unable to retrieve your company information.");
      }
    };
    
    if (!companyInfo && !isLoadingCompanyInfo) {
      getUserCompany();
    }
  }, [companyInfo, isLoadingCompanyInfo]);
  
  const handleAnalyzeCompany = async (companyName: string) => {
    if (!companyName.trim()) {
      toast({
        title: "Company name required",
        description: "No company name found in your profile.",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoadingCompanyInfo(true);
    setAnalysisError(null);
    
    try {
      const result = await companyAnalysisService.getCompanyAnalysis(companyName);
      setCompanyInfo(result);
      
      // Pre-fill form data with company information
      setFormData((prevData: ESGFormValues | null) => ({
        ...prevData || {},
        companyName: companyName,
        industry: result.industry,
        employeeCount: result.employeeCount
      }));
      
      // Set progress to 100% when complete
      setAnalyzingProgress(100);
      
      toast({
        title: "Company analyzed",
        description: "We've gathered information about your company to help with the assessment."
      });
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
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5" /> Company Information
        </CardTitle>
        <CardDescription>
          We're gathering information about your company to provide a more tailored assessment
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {!companyInfo ? (
          <div className="space-y-4">
            {userCompany && (
              <div className="bg-muted p-4 rounded-lg">
                <h3 className="font-medium mb-2">Analyzing: {userCompany}</h3>
                
                <div className="space-y-3">
                  <Progress value={analyzingProgress} className="h-2" />
                  
                  <div className="flex justify-between items-center text-xs text-muted-foreground">
                    <span>Gathering information...</span>
                    <span>{analyzingProgress}%</span>
                  </div>
                  
                  {isLoadingCompanyInfo && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>
                        {analyzingProgress < 20 ? "Initializing company analysis..." : 
                         analyzingProgress < 40 ? "Researching company details..." :
                         analyzingProgress < 60 ? "Gathering industry information..." :
                         analyzingProgress < 80 ? "Processing company data..." :
                         "Finalizing analysis..."}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {analysisError && (
              <div className="bg-destructive/10 p-4 rounded-lg text-destructive">
                <h3 className="font-medium mb-1">Analysis Error</h3>
                <p className="text-sm">{analysisError}</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => userCompany && handleAnalyzeCompany(userCompany)}
                  className="mt-2"
                >
                  Retry Analysis
                </Button>
              </div>
            )}
            
            {isLoadingCompanyInfo && !analysisError && (
              <div className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-20 w-full" />
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-muted p-4 rounded-lg">
              <h3 className="font-medium text-lg mb-2">Company Overview</h3>
              <p className="text-sm text-muted-foreground">{companyInfo.overview}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-2">
                <div className="bg-primary/10 p-2 rounded-full">
                  <Info className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h4 className="text-sm font-medium">Industry</h4>
                  <p className="text-sm text-muted-foreground">{companyInfo.industry}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-2">
                <div className="bg-primary/10 p-2 rounded-full">
                  <Users className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h4 className="text-sm font-medium">Company Size</h4>
                  <p className="text-sm text-muted-foreground">{companyInfo.employeeCount} employees</p>
                </div>
              </div>
              
              <div className="flex items-start gap-2">
                <div className="bg-primary/10 p-2 rounded-full">
                  <MapPin className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h4 className="text-sm font-medium">Headquarters</h4>
                  <p className="text-sm text-muted-foreground">{companyInfo.location}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-2">
                <div className="bg-primary/10 p-2 rounded-full">
                  <CalendarDays className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h4 className="text-sm font-medium">Founded</h4>
                  <p className="text-sm text-muted-foreground">{companyInfo.yearFounded}</p>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium mb-2">Mission</h4>
              <p className="text-sm text-muted-foreground">{companyInfo.mission}</p>
            </div>
            
            <div>
              <h4 className="text-sm font-medium mb-2">Products & Services</h4>
              <ul className="list-disc pl-5 text-sm text-muted-foreground">
                {companyInfo.productsServices.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="text-sm font-medium mb-2">History</h4>
              <p className="text-sm text-muted-foreground">{companyInfo.history}</p>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <div className="flex justify-end w-full">
          <Button 
            onClick={onContinue} 
            disabled={isLoadingCompanyInfo && !companyInfo}
          >
            Continue to Assessment
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
