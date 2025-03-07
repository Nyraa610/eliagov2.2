
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
  const [activeTab, setActiveTab] = useState("identify");
  
  // Form definition
  const form = useForm<MaterialityFormValues>({
    resolver: zodResolver(materialitySchema),
    defaultValues: {
      companyName: "",
      materialIssues: "",
      impactOnBusiness: 5,
      impactOnStakeholders: 5,
      stakeholderFeedback: "",
    },
  });

  // Handler for tab changes to update status
  const handleTabChange = (tab: string) => {
    // If this is the first tab and status is not-started, change to in-progress
    if (tab === "identify" && analysisStatus === "not-started") {
      setAnalysisStatus("in-progress");
    }
    
    setActiveTab(tab);
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
