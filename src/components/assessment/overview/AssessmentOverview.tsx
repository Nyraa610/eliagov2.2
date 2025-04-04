
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { FeatureStatus } from "@/types/training";
import { History, HelpCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { assessmentService } from "@/services/assessmentService";
import { engagementService } from "@/services/engagement";

interface AssessmentOverviewProps {
  diagStatus: FeatureStatus;
  setDiagStatus: (status: FeatureStatus) => void;
  showDiagnostic: (show: boolean) => void;
  setActiveAssessmentTab: (tab: string) => void;
  onViewHistory?: () => void;
}

export function AssessmentOverview({ 
  showDiagnostic, 
  setDiagStatus, 
  setActiveAssessmentTab,
  diagStatus,
  onViewHistory
}: AssessmentOverviewProps) {
  const { t } = useTranslation();

  useEffect(() => {
    const loadSavedStatuses = async () => {
      const diagProgress = await assessmentService.getAssessmentProgress('rse_diagnostic');
      if (diagProgress) {
        setDiagStatus(diagProgress.status as FeatureStatus);
      }
    };
    
    loadSavedStatuses().catch(error => {
      console.error("Error loading assessment statuses:", error);
    });
  }, [setDiagStatus]);

  const handleStartDiagnostic = () => {
    setActiveAssessmentTab("company-info");
    showDiagnostic(true);
    
    // Track starting assessment with engagement service (award 5 points)
    engagementService.trackActivity({
      activity_type: 'start_assessment',
      points_earned: 5,
      metadata: {
        assessment_type: 'rse_diagnostic',
        timestamp: new Date().toISOString()
      }
    }).catch(error => {
      console.error("Error tracking assessment start:", error);
    });
    
    if (diagStatus === "not-started") {
      setDiagStatus("in-progress");
      assessmentService.saveAssessmentProgress('rse_diagnostic', 'in-progress', 25)
        .catch(error => console.error("Error updating diagnostic status:", error));
    }
  };

  const getStatusBadge = (status: FeatureStatus) => {
    switch(status) {
      case "completed":
        return <span className="text-sm font-medium text-green-600 bg-green-50 px-2.5 py-0.5 rounded-full">{t("assessment.status.completed")}</span>;
      case "in-progress":
        return <span className="text-sm font-medium text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full">{t("assessment.status.inProgress")}</span>;
      default:
        return <span className="text-sm font-medium text-gray-600 bg-gray-100 px-2.5 py-0.5 rounded-full">{t("assessment.status.notStarted")}</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">{t("assessment.overview.title")}</h2>
        {onViewHistory && diagStatus !== "not-started" && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onViewHistory}
            className="flex items-center gap-1"
          >
            <History className="h-4 w-4" />
            View Assessment History
          </Button>
        )}
      </div>
      
      <Card className="overflow-hidden">
        <CardHeader className="pb-2 space-y-1">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Unified ESG/RSE Assessment</CardTitle>
            {getStatusBadge(diagStatus)}
          </div>
          <CardDescription>In-depth assessment to evaluate current practices and identify opportunities</CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="flex items-start space-x-4 mb-4">
            <div className="bg-primary/10 p-2.5 rounded-full">
              <HelpCircle className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                This assessment helps analyze your company's current sustainability practices across environmental, social, 
                and governance dimensions to identify strengths and areas for improvement.
              </p>
            </div>
          </div>
          
          <div className="flex justify-end">
            <Button 
              onClick={handleStartDiagnostic}
              className="mt-2"
            >
              {diagStatus === "not-started" 
                ? t("assessment.startAssessment") 
                : diagStatus === "completed"
                  ? t("assessment.startNewAssessment", "Start New Assessment")
                  : t("assessment.continueAssessment")}
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <div className="bg-muted p-4 rounded-lg">
        <h3 className="font-medium">{t("assessment.disclaimer.title")}</h3>
        <p className="text-sm text-muted-foreground mt-1">
          {t("assessment.disclaimer.description")}
        </p>
      </div>
    </div>
  );
}
