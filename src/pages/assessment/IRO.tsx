
import { useState, useEffect } from "react";
import { UserLayout } from "@/components/user/UserLayout";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { FeatureStatus } from "@/types/training";
import { IROForm } from "@/components/assessment/iro-analysis/IROForm";
import { assessmentService } from "@/services/assessmentService";
import { useToast } from "@/components/ui/use-toast";
import { IROFormValues } from "@/components/assessment/iro-analysis/formSchema";
import { useEngagement } from "@/hooks/useEngagement";

export default function IRO() {
  const { t } = useTranslation();
  const [analysisStatus, setAnalysisStatus] = useState<FeatureStatus>("not-started");
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();
  const [savedFormData, setSavedFormData] = useState<IROFormValues | undefined>(undefined);
  const { trackActivity } = useEngagement();

  // Load saved progress when component mounts
  useEffect(() => {
    const loadSavedProgress = async () => {
      const savedProgress = await assessmentService.getAssessmentProgress('iro_analysis');
      
      if (savedProgress) {
        setAnalysisStatus(savedProgress.status as FeatureStatus);
        setProgress(savedProgress.progress);
        
        if (savedProgress.form_data) {
          setSavedFormData(savedProgress.form_data as IROFormValues);
        }
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

    // Track the page view
    trackActivity({
      activity_type: "view_iro_analysis",
      points_earned: 5,
      metadata: { page: "iro_analysis" }
    });
  }, [toast, trackActivity]);

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
    <UserLayout title={t("assessment.iro.title", "Impact, Risks, and Opportunities Analysis")}>
      <div className="mb-6">
        <Link to="/assessment" className="text-primary hover:underline flex items-center mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to Assessment
        </Link>
        <p className="text-gray-600">
          {t("assessment.iro.description", "Identify and assess potential risks and opportunities related to your ESG performance")}
        </p>
      </div>
      
      <IROForm
        analysisStatus={analysisStatus}
        setAnalysisStatus={handleStatusChange}
        progress={progress}
        setProgress={handleProgressChange}
        savedFormData={savedFormData}
      />
    </UserLayout>
  );
}
