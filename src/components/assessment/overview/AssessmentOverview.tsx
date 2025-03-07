
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { FeatureStatus } from "@/types/training";
import { HelpCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { assessmentService } from "@/services/assessmentService";

interface AssessmentOverviewProps {
  showDiagnostic: (show: boolean) => void;
  setDiagStatus: (status: FeatureStatus) => void;
  setActiveAssessmentTab: (tab: string) => void;
  diagStatus: FeatureStatus;
}

export function AssessmentOverview({ 
  showDiagnostic, 
  setDiagStatus, 
  setActiveAssessmentTab,
  diagStatus
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
    
    if (diagStatus === "not-started") {
      setDiagStatus("in-progress");
      assessmentService.saveAssessmentProgress('rse_diagnostic', 'in-progress', 25)
        .catch(error => console.error("Error updating diagnostic status:", error));
    }
  };

  const getStatusBadge = (status: FeatureStatus) => {
    switch(status) {
      case "completed":
        return <span className="text-sm font-medium text-green-600 bg-green-50 px-2.5 py-0.5 rounded-full">Completed</span>;
      case "in-progress":
        return <span className="text-sm font-medium text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full">In Progress</span>;
      default:
        return <span className="text-sm font-medium text-gray-600 bg-gray-100 px-2.5 py-0.5 rounded-full">Not Started</span>;
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">{t("assessment.overview.title")}</h2>
      
      <Card className="overflow-hidden">
        <CardHeader className="pb-2 space-y-1">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">{t("assessment.diagnosticRSE.title")}</CardTitle>
            {getStatusBadge(diagStatus)}
          </div>
          <CardDescription>{t("assessment.diagnosticRSE.description")}</CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="flex items-start space-x-4 mb-4">
            <div className="bg-primary/10 p-2.5 rounded-full">
              <HelpCircle className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                {t("assessment.diagnosticRSE.longDescription")}
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
                : t("assessment.continueAssessment")}
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <div className="bg-muted p-4 rounded-lg">
        <h3 className="font-medium">{t("assessment.overview.disclaimer")}</h3>
        <p className="text-sm text-muted-foreground mt-1">
          {t("assessment.overview.disclaimerDescription")}
        </p>
      </div>
    </div>
  );
}
