import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { CarbonEvaluationForm } from "@/components/assessment/carbon-evaluation/CarbonEvaluationForm";
import { assessmentService } from "@/services/assessment";
import { useToast } from "@/components/ui/use-toast";
import { FeatureStatus } from "@/types/training";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

export default function CarbonEvaluation() {
  const { t } = useTranslation();
  const [evalStatus, setEvalStatus] = useState<FeatureStatus>("not-started");
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

  // Load saved progress when component mounts
  useEffect(() => {
    const loadSavedProgress = async () => {
      const savedProgress = await assessmentService.getAssessmentProgress('carbon_evaluation');
      
      if (savedProgress) {
        setEvalStatus(savedProgress.status as FeatureStatus);
        setProgress(savedProgress.progress);
      }
    };
    
    loadSavedProgress().catch(error => {
      console.error("Error loading carbon evaluation progress:", error);
      toast({
        title: "Error",
        description: "Failed to load saved progress",
        variant: "destructive"
      });
    });
  }, [toast]);

  // Handler to update status with persistence
  const handleStatusChange = (status: FeatureStatus) => {
    setEvalStatus(status);
    assessmentService.saveAssessmentProgress('carbon_evaluation', status, progress)
      .catch(error => console.error("Error saving status:", error));
  };

  // Handler to update progress with persistence
  const handleProgressChange = (newProgress: number) => {
    setProgress(newProgress);
    assessmentService.saveAssessmentProgress('carbon_evaluation', evalStatus, newProgress)
      .catch(error => console.error("Error saving progress:", error));
  };

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-primary mb-2">{t("assessment.carbonEvaluation.title")}</h1>
        <p className="text-gray-600">
          {t("assessment.carbonEvaluation.description")}
        </p>
      </div>
      
      <CarbonEvaluationForm
        evalStatus={evalStatus}
        setEvalStatus={handleStatusChange}
        progress={progress}
        setProgress={handleProgressChange}
      />
    </>
  );
}
