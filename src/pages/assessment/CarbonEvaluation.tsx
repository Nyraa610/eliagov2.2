
import { useState, useEffect } from "react";
import { UserLayout } from "@/components/user/UserLayout";
import { AssessmentBase } from "@/components/assessment/AssessmentBase";
import { useTranslation } from "react-i18next";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { FeatureStatus } from "@/types/training";
import { carbonEvaluationSchema, CarbonEvaluationFormValues } from "@/components/assessment/carbon-evaluation/formSchema";
import { CarbonEvaluationTabs } from "@/components/assessment/carbon-evaluation/CarbonEvaluationTabs";

export default function CarbonEvaluation() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("company-info");
  const [evalStatus, setEvalStatus] = useState<FeatureStatus>("not-started");
  const [progress, setProgress] = useState(0);
  
  // Define tabs to track progress
  const tabs = ["company-info", "direct-emissions", "indirect-emissions", "transportation"];
  const tabWeights = {
    "company-info": 25,
    "direct-emissions": 25,
    "indirect-emissions": 25,
    "transportation": 25
  };
  
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

  // Track form values to update progress
  useEffect(() => {
    const subscription = form.watch((value) => {
      calculateProgress(value as CarbonEvaluationFormValues);
    });
    return () => subscription.unsubscribe();
  }, [form.watch]);

  // Calculate progress based on form completion
  const calculateProgress = (values: CarbonEvaluationFormValues) => {
    let completedWeight = 0;
    
    // Company info
    if (values.companyName && values.yearOfEvaluation) {
      completedWeight += tabWeights["company-info"];
    }
    
    // Direct emissions
    if (values.scope1Emissions) {
      completedWeight += tabWeights["direct-emissions"];
    }
    
    // Indirect emissions
    if (values.scope2Emissions && values.scope3Emissions) {
      completedWeight += tabWeights["indirect-emissions"];
    }
    
    // Transportation
    if (values.transportationUsage) {
      completedWeight += tabWeights["transportation"];
    }
    
    setProgress(completedWeight);
  };

  // Handler for tab changes to update status
  const handleTabChange = (tab: string) => {
    // If this is the first tab and status is not-started, change to in-progress
    if (tab === tabs[0] && evalStatus === "not-started") {
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
    <UserLayout title={t("assessment.carbonEvaluation.title")}>
      <div className="mb-6">
        <Link to="/assessment" className="text-primary hover:underline flex items-center mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to Assessment
        </Link>
        <p className="text-gray-600">
          {t("assessment.carbonEvaluation.description")}
        </p>
      </div>
      
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
    </UserLayout>
  );
}
