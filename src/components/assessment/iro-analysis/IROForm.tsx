import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AssessmentBase } from "@/components/assessment/AssessmentBase";
import { IROTabs } from "./IROTabs";
import { iroFormSchema, IROFormValues } from "./formSchema";
import { FeatureStatus } from "@/types/training";
import { useTranslation } from "react-i18next";
import { assessmentService } from "@/services/assessment";
import { useToast } from "@/components/ui/use-toast";

// Default data to pre-populate the form
const defaultFormValues: IROFormValues = {
  methodology: {
    impactScale: [
      { value: 1, label: "Low", description: "Minimal impact to the organization" },
      { value: 2, label: "Medium", description: "Moderate impact requiring attention" },
      { value: 3, label: "High", description: "Significant impact requiring immediate action" },
    ],
    likelihoodScale: [
      { value: 1, label: "Unlikely", description: "Very low probability of occurrence" },
      { value: 2, label: "Possible", description: "May occur under certain conditions" },
      { value: 3, label: "Likely", description: "High probability of occurrence" },
    ],
  },
  items: [],
  companyName: "Your Company" // Default company name
};

interface IROFormProps {
  analysisStatus: FeatureStatus;
  setAnalysisStatus: (status: FeatureStatus) => void;
  progress: number;
  setProgress: (progress: number) => void;
  savedFormData?: IROFormValues;
}

export function IROForm({ 
  analysisStatus,
  setAnalysisStatus,
  progress,
  setProgress,
  savedFormData
}: IROFormProps) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("methodology");
  const { toast } = useToast();
  
  // Form definition with default values
  const form = useForm<IROFormValues>({
    resolver: zodResolver(iroFormSchema),
    defaultValues: savedFormData || defaultFormValues,
  });

  // Save form data whenever it changes significantly
  const saveFormData = async () => {
    try {
      const currentFormData = form.getValues();
      await assessmentService.saveAssessmentProgress(
        'iro_analysis',
        analysisStatus,
        progress,
        currentFormData
      );
      console.log("IROForm: Form data saved successfully");
    } catch (error) {
      console.error("Error saving form data:", error);
      toast({
        title: "Save Error",
        description: "Failed to save your analysis data",
        variant: "destructive"
      });
    }
  };

  // Handler for tab changes to update status and save data
  const handleTabChange = (tab: string) => {
    // Save current form data before changing tabs
    saveFormData();
    
    // If this is the first tab and status is not-started, change to in-progress
    if (tab === "methodology" && analysisStatus === "not-started") {
      setAnalysisStatus("in-progress");
    }
    
    setActiveTab(tab);
    
    // Update progress based on tab
    if (tab === "methodology") {
      setProgress(33);
    } else if (tab === "analysis") {
      setProgress(66);
    } else if (tab === "review") {
      setProgress(100);
    }
  };

  // Save data on form submission
  async function onSubmit(values: IROFormValues) {
    console.log("Submitting form with data:", values);
    
    try {
      // Save the final form data
      await assessmentService.saveAssessmentProgress(
        'iro_analysis',
        'waiting-for-approval',
        100,
        values
      );
      
      setAnalysisStatus("waiting-for-approval");
      setProgress(100);
      
      toast({
        title: "Submission Successful",
        description: "Your IRO analysis has been submitted for approval",
      });
    } catch (error) {
      console.error("Error submitting form:", error);
      toast({
        title: "Submission Error",
        description: "Failed to submit your analysis. Please try again.",
        variant: "destructive"
      });
    }
  }

  // Set up form watch and save periodically (every 30 seconds)
  useEffect(() => {
    const intervalId = setInterval(() => {
      saveFormData();
    }, 30000); // Save every 30 seconds

    return () => {
      clearInterval(intervalId);
      // Save when component unmounts
      saveFormData();
    };
  }, []);

  return (
    <AssessmentBase 
      title={t("assessment.iro.title", "Impact, Risks, and Opportunities Analysis")} 
      description={t("assessment.iro.description", "Identify and assess potential risks and opportunities related to your ESG performance")}
      status={analysisStatus}
      progress={progress}
    >
      <IROTabs
        form={form}
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        onSubmit={onSubmit}
        analysisStatus={analysisStatus}
      />
    </AssessmentBase>
  );
}
