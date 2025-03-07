
import { useState, useEffect } from "react";
import { UserLayout } from "@/components/user/UserLayout";
import { AssessmentBase } from "@/components/assessment/AssessmentBase";
import { useTranslation } from "react-i18next";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { FeatureStatus } from "@/types/training";
import { actionPlanSchema, ActionPlanFormValues } from "@/components/assessment/action-plan/formSchema";
import { ActionPlanTabs } from "@/components/assessment/action-plan/ActionPlanTabs";

export default function ActionPlan() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("goals");
  const [actionPlanStatus, setActionPlanStatus] = useState<FeatureStatus>("not-started");
  const [progress, setProgress] = useState(0);
  
  // Define tabs to track progress
  const tabs = ["goals", "initiatives", "timeline", "review"];
  const tabWeights = {
    goals: 25,
    initiatives: 25,
    timeline: 25,
    review: 25
  };
  
  // Form definition
  const form = useForm<ActionPlanFormValues>({
    resolver: zodResolver(actionPlanSchema),
    defaultValues: {
      companyName: "",
      shortTermGoals: "",
      midTermGoals: "",
      longTermGoals: "",
      keyInitiatives: "",
      timeline: "",
    },
  });

  // Track form values to update progress
  useEffect(() => {
    const subscription = form.watch((value) => {
      calculateProgress(value as ActionPlanFormValues);
    });
    return () => subscription.unsubscribe();
  }, [form.watch]);

  // Calculate progress based on form completion
  const calculateProgress = (values: ActionPlanFormValues) => {
    let completedWeight = 0;
    
    // Check which sections have data
    if (values.companyName || values.shortTermGoals || values.midTermGoals || values.longTermGoals) {
      completedWeight += tabWeights.goals * getTabCompletion("goals", values);
    }
    
    if (values.keyInitiatives) {
      completedWeight += tabWeights.initiatives * getTabCompletion("initiatives", values);
    }
    
    if (values.timeline) {
      completedWeight += tabWeights.timeline * getTabCompletion("timeline", values);
    }
    
    // Review tab is considered based on overall form completion
    const formCompletion = Object.values(values).filter(Boolean).length / Object.keys(values).length;
    completedWeight += tabWeights.review * formCompletion;
    
    setProgress(completedWeight);
  };
  
  // Calculate completion percentage for each tab
  const getTabCompletion = (tab: string, values: ActionPlanFormValues) => {
    switch (tab) {
      case "goals":
        const goalFields = [values.companyName, values.shortTermGoals, values.midTermGoals, values.longTermGoals];
        return goalFields.filter(Boolean).length / goalFields.length;
      case "initiatives":
        return values.keyInitiatives ? 1 : 0;
      case "timeline":
        return values.timeline ? 1 : 0;
      default:
        return 0;
    }
  };

  // Handler for tab changes to update status
  const handleTabChange = (tab: string) => {
    // If this is the first tab and status is not-started, change to in-progress
    if (tab === tabs[0] && actionPlanStatus === "not-started") {
      setActionPlanStatus("in-progress");
    }
    
    setActiveTab(tab);
  };

  function onSubmit(values: ActionPlanFormValues) {
    console.log(values);
    // Here we would save the data and potentially navigate to the next step
    setActionPlanStatus("waiting-for-approval");
    setProgress(100); // Set to 100% on submission
  }

  return (
    <UserLayout title={t("assessment.actionPlan.title")}>
      <div className="mb-6">
        <Link to="/assessment" className="text-primary hover:underline flex items-center mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to Assessment
        </Link>
        <p className="text-gray-600">
          {t("assessment.actionPlan.description")}
        </p>
      </div>
      
      <AssessmentBase 
        title={t("assessment.actionPlan.title")} 
        description={t("assessment.actionPlan.description")}
        status={actionPlanStatus}
        progress={progress}
      >
        <ActionPlanTabs
          form={form}
          activeTab={activeTab}
          setActiveTab={handleTabChange}
          onSubmit={onSubmit}
        />
      </AssessmentBase>
    </UserLayout>
  );
}
