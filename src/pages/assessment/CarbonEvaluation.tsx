
import { useState } from "react";
import { UserLayout } from "@/components/user/UserLayout";
import { useTranslation } from "react-i18next";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { FeatureStatus } from "@/types/training";
import { CarbonEvaluationForm } from "@/components/assessment/carbon-evaluation/CarbonEvaluationForm";

export default function CarbonEvaluation() {
  const { t } = useTranslation();
  const [evalStatus, setEvalStatus] = useState<FeatureStatus>("not-started");
  const [progress, setProgress] = useState(0);

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
      
      <CarbonEvaluationForm
        evalStatus={evalStatus}
        setEvalStatus={setEvalStatus}
        progress={progress}
        setProgress={setProgress}
      />
    </UserLayout>
  );
}
