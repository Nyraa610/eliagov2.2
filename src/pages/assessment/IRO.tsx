
import { useState, useEffect } from "react";
import { UserLayout } from "@/components/user/UserLayout";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { FeatureStatus } from "@/types/training";
import { IROAssessmentForm } from "@/components/assessment/iro/IROAssessmentForm";
import { assessmentService } from "@/services/assessmentService";
import { useToast } from "@/components/ui/use-toast";

export default function IRO() {
  const { t } = useTranslation();
  const [analysisStatus, setAnalysisStatus] = useState<FeatureStatus>("not-started");
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

  // Load saved progress when component mounts
  useEffect(() => {
    const loadSavedProgress = async () => {
      const savedProgress = await assessmentService.getAssessmentProgress('iro_analysis');
      
      if (savedProgress) {
        setAnalysisStatus(savedProgress.status as FeatureStatus);
        setProgress(savedProgress.progress);
      }
    };
    
    loadSavedProgress().catch(error => {
      console.error("Error loading IRO analysis progress:", error);
      toast({
        title: "Error",
        description: "Failed to load saved progress",
        variant: "destructive"
      });
    });
  }, [toast]);

  // Handler to update status with persistence
  const handleStatusChange = (status: FeatureStatus) => {
    setAnalysisStatus(status);
    assessmentService.saveAssessmentProgress('iro_analysis', status, progress)
      .catch(error => console.error("Error saving status:", error));
  };

  // Handler to update progress with persistence
  const handleProgressChange = (newProgress: number) => {
    setProgress(newProgress);
    assessmentService.saveAssessmentProgress('iro_analysis', analysisStatus, newProgress)
      .catch(error => console.error("Error saving progress:", error));
  };

  return (
    <UserLayout title={t("assessment.iro.title") || "Impact, Risks & Opportunities"}>
      <div className="mb-6">
        <Link to="/assessment" className="text-primary hover:underline flex items-center mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to Assessment
        </Link>
        <p className="text-gray-600">
          {t("assessment.iro.description") || "Analyze your company's sustainability impacts, risks, and opportunities to develop a comprehensive understanding of your ESG position."}
        </p>
      </div>
      
      <IROAssessmentForm
        analysisStatus={analysisStatus}
        setAnalysisStatus={handleStatusChange}
        progress={progress}
        setProgress={handleProgressChange}
      />
    </UserLayout>
  );
}
