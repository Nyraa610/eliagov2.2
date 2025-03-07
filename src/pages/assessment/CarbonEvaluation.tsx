
import { useState } from "react";
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
  const [evalStatus, setEvalStatus] = useState<FeatureStatus>("completed");
  
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

  function onSubmit(values: CarbonEvaluationFormValues) {
    console.log(values);
    // Here we would save the data and potentially navigate to the next step
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
      >
        <CarbonEvaluationTabs
          form={form}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onSubmit={onSubmit}
        />
      </AssessmentBase>
    </UserLayout>
  );
}
