
import { useState, useEffect } from "react";
import { UserLayout } from "@/components/user/UserLayout";
import { AssessmentBase } from "@/components/assessment/AssessmentBase";
import { useTranslation } from "react-i18next";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { FeatureStatus } from "@/types/training";
import { MaterialityAnalysisTabs } from "@/components/assessment/materiality-analysis/MaterialityAnalysisTabs";
import { materialitySchema, MaterialityFormValues } from "@/components/assessment/materiality-analysis/formSchema";

export default function MaterialityAnalysis() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("identify");
  const [analysisStatus, setAnalysisStatus] = useState<FeatureStatus>("not-started");
  const [progress, setProgress] = useState(0);
  
  // Define tabs to track progress
  const tabs = ["identify", "assess", "stakeholder", "prioritize"];
  const tabWeights = {
    identify: 25,
    assess: 25,
    stakeholder: 25,
    prioritize: 25
  };
  
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

  // Track form values to update progress
  useEffect(() => {
    const subscription = form.watch((value) => {
      calculateProgress(value as MaterialityFormValues);
    });
    return () => subscription.unsubscribe();
  }, [form.watch]);

  // Calculate progress based on form completion
  const calculateProgress = (values: MaterialityFormValues) => {
    let completedWeight = 0;
    
    // Check which sections have data
    if (values.companyName && values.materialIssues) {
      completedWeight += tabWeights.identify;
    }
    
    if (values.impactOnBusiness !== undefined && values.impactOnStakeholders !== undefined) {
      completedWeight += tabWeights.assess;
    }
    
    if (values.stakeholderFeedback) {
      completedWeight += tabWeights.stakeholder;
    }
    
    // Prioritize tab is considered if the other tabs are complete
    const otherTabsComplete = completedWeight >= 75;
    if (otherTabsComplete) {
      completedWeight += tabWeights.prioritize / 2; // Partially complete until submission
    }
    
    setProgress(completedWeight);
  };

  // Handler for tab changes to update status
  const handleTabChange = (tab: string) => {
    // If this is the first tab and status is not-started, change to in-progress
    if (tab === tabs[0] && analysisStatus === "not-started") {
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
    <UserLayout title={t("assessment.materialityAnalysis.title")}>
      <div className="mb-6">
        <Link to="/assessment" className="text-primary hover:underline flex items-center mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to Assessment
        </Link>
        <p className="text-gray-600">
          {t("assessment.materialityAnalysis.description")}
        </p>
      </div>
      
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
    </UserLayout>
  );
}
