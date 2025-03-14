
import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useToast } from "@/components/ui/use-toast";
import { ESGFormValues, esgFormSchema } from "../../esg-diagnostic/ESGFormSchema";
import { supabase } from "@/lib/supabase";
import { assessmentService } from "@/services/assessmentService";

export const useUnifiedFormSubmission = (
  onSubmit: (values: ESGFormValues) => void,
  onAnalysisComplete: (analysisResult: string) => void
) => {
  const [activeTab, setActiveTab] = useState("company");
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userCompany, setUserCompany] = useState<string | null>(null);
  
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

  // Get the user's company when component mounts
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
          }
        }
      } catch (error) {
        console.error("Error fetching user company:", error);
      }
    };
    
    getUserCompany();
    
    // Try to load any saved progress
    const loadSavedProgress = async () => {
      const savedProgress = await assessmentService.getAssessmentProgress('rse_diagnostic');
      if (savedProgress?.form_data) {
        // Populate form with saved data
        Object.entries(savedProgress.form_data).forEach(([key, value]) => {
          if (key in form.getValues()) {
            form.setValue(key as any, value as any);
          }
        });
        
        toast({
          title: "Progress loaded",
          description: "Your previous assessment progress has been restored."
        });
      }
    };
    
    loadSavedProgress();
  }, [form, toast]);

  const handleTabChange = (value: string) => {
    // Save current progress before changing tabs
    const formData = form.getValues();
    assessmentService.saveAssessmentProgress(
      'rse_diagnostic',
      'in-progress',
      calculateProgress(value),
      formData
    );
    
    setActiveTab(value);
  };

  const calculateProgress = (currentTab: string) => {
    const tabs = ["company", "environmental", "social", "governance", "goals"];
    const currentIndex = tabs.indexOf(currentTab);
    return Math.round(((currentIndex + 1) / tabs.length) * 100);
  };

  const handleFormSubmit = async (values: ESGFormValues) => {
    // Use company name from user profile if available
    if (userCompany && !values.companyName) {
      values.companyName = userCompany;
    }
    
    setIsSubmitting(true);
    try {
      // Save form data to Supabase via the assessment service
      await assessmentService.saveAssessmentProgress(
        'rse_diagnostic',
        'completed',
        100,
        values
      );
      
      // Call the parent onSubmit to process the form submission
      onSubmit(values);
      
      // Generate content for AI analysis
      const contentForAnalysis = generateContentForAnalysis(values);
      
      // Perform AI analysis using the integrated approach
      const { data, error } = await supabase.functions.invoke('ai-analysis', {
        body: {
          type: 'esg-assessment',
          content: contentForAnalysis,
          analysisType: 'integrated' // Signal that this is the new integrated approach
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
        title: "Assessment submitted",
        description: "Your unified ESG/RSE assessment has been saved and analyzed successfully."
      });
    } catch (error) {
      console.error("Error submitting diagnostic:", error);
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

  return {
    form,
    isSubmitting,
    userCompany,
    activeTab,
    handleTabChange,
    handleFormSubmit
  };
};
