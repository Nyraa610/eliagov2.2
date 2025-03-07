
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AssessmentBase } from "@/components/assessment/AssessmentBase";
import { CarbonEvaluationTabs } from "./CarbonEvaluationTabs";
import { carbonEvaluationSchema, CarbonEvaluationFormValues } from "./formSchema";
import { FeatureStatus } from "@/types/training";
import { useTranslation } from "react-i18next";
import { useProgressTracker } from "./useProgressTracker";

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
    },
  });

  // Use the progress tracker hook
  useProgressTracker(form.watch, setProgress);

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
    // Here we would save the data and potentially navigate to the next step
    setEvalStatus("completed");
    setProgress(100); // Set to 100% on submission
  }

  return (
    <AssessmentBase 
      title={t("assessment.carbonEvaluation.title")} 
      description={t("assessment.carbonEvaluation.description")}
      status={evalStatus}
      progress={progress}
    >
      <CarbonEvaluationTabs
        form={form}
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        onSubmit={onSubmit}
      />
    </AssessmentBase>
  );
}
