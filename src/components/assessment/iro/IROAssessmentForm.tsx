
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AssessmentBase } from "@/components/assessment/AssessmentBase";
import { IROAnalysisTabs } from "./IROAnalysisTabs";
import { iroSchema, IROFormValues } from "./formSchema";
import { FeatureStatus } from "@/types/training";
import { useTranslation } from "react-i18next";

interface IROAssessmentFormProps {
  analysisStatus: FeatureStatus;
  setAnalysisStatus: (status: FeatureStatus) => void;
  progress: number;
  setProgress: (progress: number) => void;
}

export function IROAssessmentForm({ 
  analysisStatus,
  setAnalysisStatus,
  progress,
  setProgress
}: IROAssessmentFormProps) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("impact");
  
  // Form definition
  const form = useForm<IROFormValues>({
    resolver: zodResolver(iroSchema),
    defaultValues: {
      companyActivities: "",
      companyImpacts: "",
      identifiedRisks: "",
      riskProbability: 3,
      riskSeverity: 3,
      identifiedOpportunities: "",
      opportunityRelevance: 3,
      opportunityValue: 3,
    },
  });

  // Handler for tab changes to update status
  const handleTabChange = (tab: string) => {
    // If this is the first tab and status is not-started, change to in-progress
    if (tab === "impact" && analysisStatus === "not-started") {
      setAnalysisStatus("in-progress");
    }
    
    setActiveTab(tab);
  };

  function onSubmit(values: IROFormValues) {
    console.log(values);
    // Here we would save the data and potentially navigate to the next step
    setAnalysisStatus("waiting-for-approval");
    setProgress(100); // Set to 100% on submission
  }

  return (
    <AssessmentBase 
      title={t("assessment.iro.title") || "Impact, Risks & Opportunities"} 
      description={t("assessment.iro.description") || "Analyze your company's impacts, risks, and opportunities related to sustainability."}
      status={analysisStatus}
      progress={progress}
    >
      <IROAnalysisTabs
        form={form}
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        onSubmit={onSubmit}
      />
    </AssessmentBase>
  );
}
