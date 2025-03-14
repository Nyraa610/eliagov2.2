
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Building2, CalendarDays, Info, MapPin, Users } from "lucide-react";
import { useUnifiedAssessment } from "../context/UnifiedAssessmentContext";
import { companyAnalysisService } from "@/services/companyAnalysisService";
import { Skeleton } from "@/components/ui/skeleton";
import { ESGFormValues } from "../../esg-diagnostic/ESGFormSchema";

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
  
  const [companyName, setCompanyName] = useState("");
  
  const handleAnalyzeCompany = async () => {
    if (!companyName.trim()) {
      toast({
        title: "Company name required",
        description: "Please enter a company name to analyze.",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoadingCompanyInfo(true);
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
      
      toast({
        title: "Company analyzed",
        description: "We've gathered information about your company to help with the assessment."
      });
    } catch (error) {
      console.error("Error analyzing company:", error);
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
          Let's learn about your company to provide a more tailored assessment
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {!companyInfo ? (
          <div className="space-y-4">
            <div className="flex flex-col space-y-2">
              <label htmlFor="companyName" className="text-sm font-medium">
                Company Name
              </label>
              <div className="flex gap-2">
                <Input 
                  id="companyName"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Enter your company name"
                  className="flex-1"
                />
                <Button 
                  onClick={handleAnalyzeCompany}
                  disabled={isLoadingCompanyInfo || !companyName.trim()}
                >
                  {isLoadingCompanyInfo ? "Analyzing..." : "Analyze"}
                </Button>
              </div>
            </div>
            
            {isLoadingCompanyInfo && (
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
          <Button onClick={onContinue} disabled={isLoadingCompanyInfo && !companyInfo}>
            Continue to Assessment
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
