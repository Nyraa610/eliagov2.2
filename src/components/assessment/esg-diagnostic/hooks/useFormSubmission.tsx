
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";
import { ESGFormValues, esgFormSchema } from "../ESGFormSchema";

export function useFormSubmission(
  onSubmit: (values: ESGFormValues) => void,
  onAnalysisComplete: (analysisResult: string) => void
) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userCompany, setUserCompany] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("company");
  const { toast } = useToast();
  
  const form = useForm<ESGFormValues>({
    resolver: zodResolver(esgFormSchema),
    defaultValues: {
      companyName: "",
      industry: "",
      employeeCount: "",
      wasteManagement: "",
      carbonFootprint: "",
      renewableEnergy: "",
      employeeWellbeing: "",
      communityEngagement: "",
      diversityInitiatives: "",
      independentBoard: "",
      transparencyPractices: "",
      ethicalDecisionMaking: "",
      mainGoals: "",
      existingInitiatives: "",
    },
  });

  // Load user company information
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
            form.setValue('companyName', companyName);
          } else {
            toast({
              title: "No company found",
              description: "Please set up your company in your profile before proceeding.",
              variant: "destructive"
            });
          }
        }
      } catch (error) {
        console.error("Error fetching user company:", error);
      }
    };
    
    getUserCompany();
  }, [form, toast]);

  const handleFormSubmit = async (values: ESGFormValues) => {
    // Use company name from user profile if available
    if (userCompany && !values.companyName) {
      values.companyName = userCompany;
    }
    
    if (!values.companyName) {
      toast({
        title: "Company name required",
        description: "Please set up your company in your profile before submitting.",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    try {
      // Save form data to Supabase
      const { data: session } = await supabase.auth.getSession();
      const userId = session?.session?.user.id;
      
      if (!userId) {
        toast({
          title: "Authentication required",
          description: "Please sign in to save your diagnostic.",
          variant: "destructive"
        });
        setIsSubmitting(false);
        return;
      }
      
      // Convert form values to content for analysis
      const contentForAnalysis = generateContentForAnalysis(values);
      
      // Call the parent onSubmit to process the form submission
      onSubmit(values);
      
      // Perform AI analysis on the form data
      const { data, error } = await supabase.functions.invoke('ai-analysis', {
        body: {
          type: 'esg-assessment',
          content: contentForAnalysis
        }
      });
      
      if (error) {
        throw error;
      }
      
      // Call the callback with the analysis result
      if (data && data.result) {
        onAnalysisComplete(data.result);
      }
      
      toast({
        title: "ESG Diagnostic submitted",
        description: "Your assessment has been saved and analyzed successfully."
      });
    } catch (error) {
      console.error("Error submitting ESG diagnostic:", error);
      toast({
        title: "Submission failed",
        description: error instanceof Error ? error.message : "An error occurred during submission",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Function to format form data for API analysis
  const generateContentForAnalysis = (values: ESGFormValues): string => {
    return `
Company: ${values.companyName}
Industry: ${values.industry}
Size: ${values.employeeCount} employees

EXISTING INITIATIVES:
${values.existingInitiatives || "No information provided"}

MAIN GOALS:
${values.mainGoals || "No information provided"}

ENVIRONMENTAL PRACTICES:
- Waste Management & Emissions: ${values.wasteManagement || "No information provided"}
- Carbon Footprint Measurement: ${values.carbonFootprint || "No information provided"}
- Renewable Energy: ${values.renewableEnergy || "No information provided"}

SOCIAL RESPONSIBILITY:
- Employee Wellbeing: ${values.employeeWellbeing || "No information provided"}
- Community Engagement: ${values.communityEngagement || "No information provided"}
- Diversity & Inclusion: ${values.diversityInitiatives || "No information provided"}

GOVERNANCE:
- Independent Board: ${values.independentBoard || "No information provided"}
- Transparency Practices: ${values.transparencyPractices || "No information provided"}
- Ethical Decision Making: ${values.ethicalDecisionMaking || "No information provided"}
`;
  };

  const handleTabChange = (value: string) => {
    // Save current form state before changing tabs
    setActiveTab(value);
  };

  return {
    form,
    isSubmitting,
    userCompany,
    activeTab,
    handleTabChange,
    handleFormSubmit
  };
}
