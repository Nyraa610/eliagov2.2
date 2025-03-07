
import { useState } from "react";
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
  const [analysisStatus, setAnalysisStatus] = useState<FeatureStatus>("blocked");
  
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

  function onSubmit(values: MaterialityFormValues) {
    console.log(values);
    // Here we would save the data and potentially navigate to the next step
    setAnalysisStatus("waiting-for-approval");
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
      >
        <MaterialityAnalysisTabs
          form={form}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onSubmit={onSubmit}
        />
      </AssessmentBase>
    </UserLayout>
  );
}
