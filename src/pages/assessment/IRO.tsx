
import { useState, useEffect } from "react";
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
  const [isLoading, setIsLoading] = useState(true);
  const { trackActivity } = useEngagement();

  // Load saved progress when component mounts
  useEffect(() => {
    const loadSavedProgress = async () => {
      setIsLoading(true);
      try {
        const savedProgress = await assessmentService.getAssessmentProgress('iro_analysis');
        
        if (savedProgress) {
          console.log("IRO: Loaded saved progress:", savedProgress);
          setAnalysisStatus(savedProgress.status as FeatureStatus);
          setProgress(savedProgress.progress);
          
          if (savedProgress.form_data) {
            console.log("IRO: Loaded saved form data");
            setSavedFormData(savedProgress.form_data as IROFormValues);
          }
        } else {
          console.log("IRO: No saved progress found");
        }
      } catch (error) {
        console.error("Error loading IRO analysis progress:", error);
        toast({
          title: "Error",
          description: "Failed to load saved progress",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadSavedProgress();

    // Track the page view with specific engagement tracking
    trackActivity({
      activity_type: "view_iro_analysis",
      points_earned: 5,
      metadata: { page: "iro_analysis" }
    });
  }, [toast, trackActivity]);

  // Handler to update status with persistence
  const handleStatusChange = async (status: FeatureStatus) => {
    setAnalysisStatus(status);
    try {
      await assessmentService.saveAssessmentProgress('iro_analysis', status, progress);
      console.log("IRO: Status saved successfully:", status);
      
      // Track completion if completed
      if (status === "completed" && analysisStatus !== "completed") {
        trackActivity({
          activity_type: "complete_iro_analysis",
          points_earned: 50,
          metadata: { assessment_type: "iro_analysis" }
        }, true); // Show reward notification
      }
      
    } catch (error) {
      console.error("Error saving status:", error);
      toast({
        title: "Save Error",
        description: "Failed to save progress status",
        variant: "destructive"
      });
    }
  };

  // Handler to update progress with persistence
  const handleProgressChange = async (newProgress: number) => {
    setProgress(newProgress);
    try {
      await assessmentService.saveAssessmentProgress('iro_analysis', analysisStatus, newProgress);
      console.log("IRO: Progress saved successfully:", newProgress);
      
      // Track significant progress (25%, 50%, 75%)
      const progressMilestones = [25, 50, 75];
      const oldProgressTier = Math.floor(progress / 25);
      const newProgressTier = Math.floor(newProgress / 25);
      
      if (newProgressTier > oldProgressTier && progressMilestones.includes(newProgressTier * 25)) {
        trackActivity({
          activity_type: "iro_progress_milestone",
          points_earned: 10,
          metadata: { 
            assessment_type: "iro_analysis",
            progress_percentage: newProgressTier * 25
          }
        }, true);
      }
      
    } catch (error) {
      console.error("Error saving progress:", error);
      toast({
        title: "Save Error",
        description: "Failed to save progress percentage",
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-8 w-64 bg-gray-200 rounded mb-4"></div>
          <div className="h-4 w-40 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <Link to="/assessment" className="text-primary hover:underline flex items-center mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to Assessment
        </Link>
        <h1 className="text-2xl font-bold mb-2">{t("assessment.iro.title", "Impact, Risks, and Opportunities Analysis")}</h1>
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
    </div>
  );
}
