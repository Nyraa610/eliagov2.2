
import { useState } from "react";
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
  const [actionPlanStatus, setActionPlanStatus] = useState<FeatureStatus>("in-progress");
  
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

  function onSubmit(values: ActionPlanFormValues) {
    console.log(values);
    // Here we would save the data and potentially navigate to the next step
    setActionPlanStatus("waiting-for-approval");
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
      >
        <ActionPlanTabs
          form={form}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onSubmit={onSubmit}
        />
      </AssessmentBase>
    </UserLayout>
  );
}
