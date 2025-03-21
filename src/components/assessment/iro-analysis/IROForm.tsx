
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AssessmentBase } from "@/components/assessment/AssessmentBase";
import { IROTabs } from "./IROTabs";
import { iroFormSchema, IROFormValues } from "./formSchema";
import { FeatureStatus } from "@/types/training";
import { useTranslation } from "react-i18next";

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
  
  // Form definition with default values
  const form = useForm<IROFormValues>({
    resolver: zodResolver(iroFormSchema),
    defaultValues: savedFormData || defaultFormValues,
  });

  // Handler for tab changes to update status
  const handleTabChange = (tab: string) => {
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

  function onSubmit(values: IROFormValues) {
    console.log(values);
    setAnalysisStatus("waiting-for-approval");
    setProgress(100); // Set to 100% on submission
  }

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
