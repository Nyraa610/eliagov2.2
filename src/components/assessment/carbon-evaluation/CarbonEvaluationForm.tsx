
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AssessmentBase } from "@/components/assessment/AssessmentBase";
import { CarbonEvaluationTabs } from "./CarbonEvaluationTabs";
import { carbonEvaluationSchema, CarbonEvaluationFormValues } from "./formSchema";
import { FeatureStatus } from "@/types/training";
import { useTranslation } from "react-i18next";
import { useProgressTracker } from "./useProgressTracker";
import { assessmentService } from "@/services/assessmentService";
import { FrameworkSelection } from "./FrameworkSelection";

interface CarbonEvaluationFormProps {
  evalStatus: FeatureStatus;
  setEvalStatus: (status: FeatureStatus) => void;
  progress: number;
  setProgress: (progress: number) => void;
}

export function CarbonEvaluationForm({ 
  evalStatus,
  setEvalStatus,
  progress,
  setProgress
}: CarbonEvaluationFormProps) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("company-info");
  const [frameworkSelected, setFrameworkSelected] = useState(false);
  const [framework, setFramework] = useState<string | null>(null);
  
  // Form definition
  const form = useForm<CarbonEvaluationFormValues>({
    resolver: zodResolver(carbonEvaluationSchema),
    defaultValues: {
      companyName: "",
      yearOfEvaluation: new Date().getFullYear().toString(),
      scope1Emissions: "",
      scope2Emissions: "",
      scope3Emissions: "",
      transportationUsage: "",
      framework: "", // Add this to the schema if needed
    },
  });

  // Load saved form data when component mounts
  useEffect(() => {
    const loadSavedFormData = async () => {
      const savedProgress = await assessmentService.getAssessmentProgress('carbon_evaluation');
      
      if (savedProgress && savedProgress.form_data) {
        form.reset(savedProgress.form_data);
        
        // If there was a previously selected framework, show the form directly
        if (savedProgress.form_data.framework) {
          setFramework(savedProgress.form_data.framework);
          setFrameworkSelected(true);
        }
      }
    };
    
    loadSavedFormData().catch(error => {
      console.error("Error loading saved form data:", error);
    });
  }, [form]);

  // Use the progress tracker hook with persistence
  const progressUpdater = (newProgress: number) => {
    setProgress(newProgress);
    // Save the current form values with the new progress
    assessmentService.saveAssessmentProgress(
      'carbon_evaluation', 
      evalStatus, 
      newProgress, 
      form.getValues()
    ).catch(error => console.error("Error saving form data and progress:", error));
  };

  useProgressTracker(form.watch, progressUpdater);

  // Handler for tab changes to update status
  const handleTabChange = (tab: string) => {
    // If this is the first tab and status is not-started, change to in-progress
    if (tab === "company-info" && evalStatus === "not-started") {
      setEvalStatus("in-progress");
    }
    
    setActiveTab(tab);
  };

  function onSubmit(values: CarbonEvaluationFormValues) {
    console.log(values);
    // Save the completed form
    const newStatus: FeatureStatus = "completed";
    setEvalStatus(newStatus);
    setProgress(100); // Set to 100% on submission
    
    assessmentService.saveAssessmentProgress('carbon_evaluation', newStatus, 100, values)
      .catch(error => console.error("Error saving completed form:", error));
  }

  const handleFrameworkSelected = (selectedFramework: string) => {
    setFramework(selectedFramework);
    setFrameworkSelected(true);
    
    // Update the form with the selected framework
    form.setValue('framework', selectedFramework);
    
    // Save the selection to the assessment progress
    const formValues = form.getValues();
    formValues.framework = selectedFramework;
    
    // Update status to in-progress once a framework is selected
    if (evalStatus === "not-started") {
      setEvalStatus("in-progress");
    }
    
    assessmentService.saveAssessmentProgress(
      'carbon_evaluation',
      'in-progress',
      progress > 10 ? progress : 10, // Ensure at least 10% progress when framework is selected
      formValues
    ).catch(error => console.error("Error saving framework selection:", error));
  };

  return (
    <AssessmentBase 
      title={t("assessment.carbonEvaluation.title")} 
      description={t("assessment.carbonEvaluation.description")}
      status={evalStatus}
      progress={progress}
    >
      {!frameworkSelected ? (
        <FrameworkSelection onFrameworkSelected={handleFrameworkSelected} />
      ) : (
        <CarbonEvaluationTabs
          form={form}
          activeTab={activeTab}
          setActiveTab={handleTabChange}
          onSubmit={onSubmit}
          framework={framework}
        />
      )}
    </AssessmentBase>
  );
}
