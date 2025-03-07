
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusCard } from "@/components/ui/status-card";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { FeatureStatus } from "@/types/training";
import { HelpCircle, ClipboardPenLine, Activity, LineChart, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { assessmentService } from "@/services/assessmentService";

export function CompanyAssessmentOverview() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [diagStatus, setDiagStatus] = useState<FeatureStatus>("not-started");
  const [carbonEvalStatus, setCarbonEvalStatus] = useState<FeatureStatus>("not-started");
  const [materialityStatus, setMaterialityStatus] = useState<FeatureStatus>("not-started");
  const [actionPlanStatus, setActionPlanStatus] = useState<FeatureStatus>("not-started");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSavedStatuses = async () => {
      try {
        setLoading(true);
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
      } catch (error) {
        console.error("Error loading assessment statuses:", error);
      } finally {
        setLoading(false);
      }
    };
    
    loadSavedStatuses();
  }, []);

  if (loading) {
    return (
      <Card className="col-span-2">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl">
            {t('dashboard.companyESGProgress')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[200px] flex items-center justify-center">
            <p className="text-muted-foreground">{t('dashboard.loading')}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="col-span-2">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl">
          {t('dashboard.companyESGProgress')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
          <StatusCard
            title={t("assessment.diagnosticRSE.title")}
            description={t("assessment.diagnosticRSE.shortDescription")}
            status={diagStatus}
            icon={<HelpCircle className="h-5 w-5" />}
            action={
              <Button onClick={() => navigate("/assessment")} size="sm">
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
              <Button onClick={() => navigate("/assessment/carbon-evaluation")} size="sm">
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
              <Button onClick={() => navigate("/assessment/materiality-analysis")} size="sm">
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
              <Button onClick={() => navigate("/assessment/action-plan")} size="sm">
                {actionPlanStatus === "not-started" 
                  ? t("assessment.startAssessment") 
                  : t("assessment.continueAssessment")}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            }
          />
        </div>
      </CardContent>
    </Card>
  );
}
