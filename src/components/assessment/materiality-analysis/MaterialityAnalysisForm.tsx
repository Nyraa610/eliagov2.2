
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AssessmentBase } from "@/components/assessment/AssessmentBase";
import { MaterialityAnalysisTabs } from "./MaterialityAnalysisTabs";
import { materialitySchema, MaterialityFormValues } from "./formSchema";
import { FeatureStatus } from "@/types/training";
import { useTranslation } from "react-i18next";

interface MaterialityAnalysisFormProps {
  analysisStatus: FeatureStatus;
  setAnalysisStatus: (status: FeatureStatus) => void;
  progress: number;
  setProgress: (progress: number) => void;
}

export function MaterialityAnalysisForm({ 
  analysisStatus,
  setAnalysisStatus,
  progress,
  setProgress
}: MaterialityAnalysisFormProps) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("introduction");
  
  // Form definition
  const form = useForm<MaterialityFormValues>({
    resolver: zodResolver(materialitySchema),
    defaultValues: {
      companyName: "",
      industry: "",
      materialIssues: [],
      stakeholderFeedback: "",
    },
  });

  // Handler for tab changes to update status
  const handleTabChange = (tab: string) => {
    // If this is the first tab after introduction and status is not-started, change to in-progress
    if (tab === "identify" && analysisStatus === "not-started") {
      setAnalysisStatus("in-progress");
    }
    
    setActiveTab(tab);
    
    // Update progress based on the tab
    switch(tab) {
      case "introduction":
        setProgress(10);
        break;
      case "identify":
        setProgress(40);
        break;
      case "stakeholders":
        setProgress(70);
        break;
      case "matrix":
        setProgress(90);
        break;
      default:
        setProgress(10);
    }
  };

  function onSubmit(values: MaterialityFormValues) {
    console.log(values);
    // Here we would save the data and potentially navigate to the next step
    setAnalysisStatus("waiting-for-approval");
    setProgress(100); // Set to 100% on submission
  }

  return (
    <AssessmentBase 
      title={t("assessment.materialityAnalysis.title")} 
      description={t("assessment.materialityAnalysis.description")}
      status={analysisStatus}
      progress={progress}
    >
      <MaterialityAnalysisTabs
        form={form}
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        onSubmit={onSubmit}
      />
    </AssessmentBase>
  );
}
