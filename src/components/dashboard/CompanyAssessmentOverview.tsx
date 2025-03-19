
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { HelpCircle, ClipboardPenLine, Activity, LineChart, ArrowRight, ActivitySquare } from "lucide-react";
import { useAssessmentProgress } from "@/hooks/useAssessmentProgress";
import { CompactStatusCard } from "./assessment/CompactStatusCard";
import { AssessmentProgressOverview } from "./assessment/AssessmentProgressOverview";

export function CompanyAssessmentOverview() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const {
    diagStatus,
    carbonEvalStatus,
    materialityStatus,
    iroStatus,
    actionPlanStatus,
    loading,
    getOverallProgress
  } = useAssessmentProgress();

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
        <AssessmentProgressOverview progress={getOverallProgress()} />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <CompactStatusCard 
            title={t("assessment.diagnosticRSE.title")}
            status={diagStatus}
            icon={<HelpCircle className="h-4 w-4" />}
            onNavigate={() => navigate("/assessment")}
          />
          
          <CompactStatusCard 
            title={t("assessment.carbonEvaluation.title")}
            status={carbonEvalStatus}
            icon={<ClipboardPenLine className="h-4 w-4" />}
            onNavigate={() => navigate("/assessment/carbon-evaluation")}
          />
          
          <CompactStatusCard 
            title={t("assessment.materialityAnalysis.title")}
            status={materialityStatus}
            icon={<Activity className="h-4 w-4" />}
            onNavigate={() => navigate("/assessment/materiality-analysis")}
          />
          
          <CompactStatusCard 
            title={t("assessment.iro.title") || "Impact, Risks & Opportunities"}
            status={iroStatus}
            icon={<ActivitySquare className="h-4 w-4" />}
            onNavigate={() => navigate("/assessment/iro")}
          />
          
          <CompactStatusCard 
            title={t("assessment.actionPlan.title")}
            status={actionPlanStatus}
            icon={<LineChart className="h-4 w-4" />}
            onNavigate={() => navigate("/assessment/action-plan")}
          />
        </div>
      </CardContent>
    </Card>
  );
}
