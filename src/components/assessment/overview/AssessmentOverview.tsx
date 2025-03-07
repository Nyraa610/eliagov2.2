import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { FeatureStatus } from "@/types/training";
import { StatusCard } from "@/components/ui/status-card";
import { ArrowRight, Check, HelpCircle, AlertTriangle, ClipboardPenLine, Activity, LineChart } from "lucide-react";
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
  const navigate = useNavigate();
  const [carbonEvalStatus, setCarbonEvalStatus] = useState<FeatureStatus>("not-started");
  const [materialityStatus, setMaterialityStatus] = useState<FeatureStatus>("not-started");
  const [actionPlanStatus, setActionPlanStatus] = useState<FeatureStatus>("not-started");

  useEffect(() => {
    const loadSavedStatuses = async () => {
      const diagProgress = await assessmentService.getAssessmentProgress('rse_diagnostic');
      if (diagProgress) {
        setDiagStatus(diagProgress.status as FeatureStatus);
      }
      
      const carbonProgress = await assessmentService.getAssessmentProgress('carbon_evaluation');
      if (carbonProgress) {
        setCarbonEvalStatus(carbonProgress.status as FeatureStatus);
      }
      
      const materialityProgress = await assessmentService.getAssessmentProgress('materiality_analysis');
      if (materialityProgress) {
        setMaterialityStatus(materialityProgress.status as FeatureStatus);
      }
      
      const actionPlanProgress = await assessmentService.getAssessmentProgress('action_plan');
      if (actionPlanProgress) {
        setActionPlanStatus(actionPlanProgress.status as FeatureStatus);
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

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">{t("assessment.overview.title")}</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <StatusCard
          title={t("assessment.diagnosticRSE.title")}
          description={t("assessment.diagnosticRSE.shortDescription")}
          status={diagStatus}
          icon={<HelpCircle className="h-5 w-5" />}
          action={
            <Button onClick={handleStartDiagnostic}>
              {diagStatus === "not-started" 
                ? t("assessment.startAssessment") 
                : t("assessment.continueAssessment")}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          }
        />
        
        <StatusCard
          title={t("assessment.carbonEvaluation.title")}
          description={t("assessment.carbonEvaluation.shortDescription")}
          status={carbonEvalStatus}
          icon={<ClipboardPenLine className="h-5 w-5" />}
          action={
            <Button onClick={() => navigate("/assessment/carbon-evaluation")}>
              {carbonEvalStatus === "not-started" 
                ? t("assessment.startAssessment") 
                : t("assessment.continueAssessment")}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          }
        />
        
        <StatusCard
          title={t("assessment.materialityAnalysis.title")}
          description={t("assessment.materialityAnalysis.shortDescription")}
          status={materialityStatus}
          icon={<Activity className="h-5 w-5" />}
          action={
            <Button onClick={() => navigate("/assessment/materiality-analysis")}>
              {materialityStatus === "not-started" 
                ? t("assessment.startAssessment") 
                : t("assessment.continueAssessment")}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          }
        />
        
        <StatusCard
          title={t("assessment.actionPlan.title")}
          description={t("assessment.actionPlan.shortDescription")}
          status={actionPlanStatus}
          icon={<LineChart className="h-5 w-5" />}
          action={
            <Button onClick={() => navigate("/assessment/action-plan")}>
              {actionPlanStatus === "not-started" 
                ? t("assessment.startAssessment") 
                : t("assessment.continueAssessment")}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          }
        />
      </div>
      
      <div className="bg-muted p-4 rounded-lg">
        <div className="flex items-start gap-4">
          <div className="bg-background p-2 rounded-full">
            <Check className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-medium">{t("assessment.overview.recommendedActions")}</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {t("assessment.overview.recommendedActionsDescription")}
            </p>
          </div>
        </div>
      </div>
      
      <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
        <div className="flex items-start gap-4">
          <div className="bg-amber-100 p-2 rounded-full">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
          </div>
          <div>
            <h3 className="font-medium text-amber-800">{t("assessment.overview.disclaimer")}</h3>
            <p className="text-sm text-amber-700 mt-1">
              {t("assessment.overview.disclaimerDescription")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
