
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { FeatureStatus } from "@/types/training";
import { MaterialityAnalysisForm } from "@/components/assessment/materiality-analysis/MaterialityAnalysisForm";
import { assessmentService } from "@/services/assessmentService";
import { useToast } from "@/components/ui/use-toast";

export default function MaterialityAnalysis() {
  const { t } = useTranslation();
  const [analysisStatus, setAnalysisStatus] = useState<FeatureStatus>("not-started");
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

  // Load saved progress when component mounts
  useEffect(() => {
    const loadSavedProgress = async () => {
      const savedProgress = await assessmentService.getAssessmentProgress('materiality_analysis');
      
      if (savedProgress) {
        setAnalysisStatus(savedProgress.status as FeatureStatus);
        setProgress(savedProgress.progress);
      }
    };
    
    loadSavedProgress().catch(error => {
      console.error("Error loading materiality analysis progress:", error);
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
    assessmentService.saveAssessmentProgress('materiality_analysis', status, progress)
      .catch(error => console.error("Error saving status:", error));
  };

  // Handler to update progress with persistence
  const handleProgressChange = (newProgress: number) => {
    setProgress(newProgress);
    assessmentService.saveAssessmentProgress('materiality_analysis', analysisStatus, newProgress)
      .catch(error => console.error("Error saving progress:", error));
  };

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-primary mb-2">{t("assessment.materialityAnalysis.title")}</h1>
        <Link to="/assessment" className="text-primary hover:underline flex items-center mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to Assessment
        </Link>
        <p className="text-gray-600">
          {t("assessment.materialityAnalysis.description")}
        </p>
      </div>
      
      <MaterialityAnalysisForm
        analysisStatus={analysisStatus}
        setAnalysisStatus={handleStatusChange}
        progress={progress}
        setProgress={handleProgressChange}
      />
    </>
  );
}
