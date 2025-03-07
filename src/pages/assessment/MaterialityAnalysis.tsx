
import { useState } from "react";
import { UserLayout } from "@/components/user/UserLayout";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { FeatureStatus } from "@/types/training";
import { MaterialityAnalysisForm } from "@/components/assessment/materiality-analysis/MaterialityAnalysisForm";

export default function MaterialityAnalysis() {
  const { t } = useTranslation();
  const [analysisStatus, setAnalysisStatus] = useState<FeatureStatus>("not-started");
  const [progress, setProgress] = useState(0);

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
      
      <MaterialityAnalysisForm
        analysisStatus={analysisStatus}
        setAnalysisStatus={setAnalysisStatus}
        progress={progress}
        setProgress={setProgress}
      />
    </UserLayout>
  );
}
