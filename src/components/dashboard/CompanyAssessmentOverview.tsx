
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusCard } from "@/components/ui/status-card";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { FeatureStatus } from "@/types/training";
import { HelpCircle, ClipboardPenLine, Activity, LineChart, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { assessmentService } from "@/services/assessmentService";
import { Progress } from "@/components/ui/progress";

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

  // Calculate overall progress
  const getOverallProgress = () => {
    const statusValues = {
      "not-started": 0,
      "in-progress": 0.5,
      "waiting-for-approval": 0.75,
      "blocked": 0.25,
      "completed": 1
    };
    
    const total = statusValues[diagStatus] + 
                  statusValues[carbonEvalStatus] + 
                  statusValues[materialityStatus] + 
                  statusValues[actionPlanStatus];
    
    return Math.round((total / 4) * 100);
  };

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
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">Overall Progress</span>
            <span className="text-sm text-muted-foreground">{getOverallProgress()}%</span>
          </div>
          <Progress value={getOverallProgress()} className="h-2" />
        </div>
        
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

interface CompactStatusCardProps {
  title: string;
  status: FeatureStatus;
  icon: React.ReactNode;
  onNavigate: () => void;
}

function CompactStatusCard({ title, status, icon, onNavigate }: CompactStatusCardProps) {
  const { t } = useTranslation();
  
  // Get status color
  const getStatusColor = (status: FeatureStatus) => {
    switch (status) {
      case "completed": return "bg-green-500";
      case "in-progress": return "bg-blue-500";
      case "waiting-for-approval": return "bg-yellow-500";
      case "blocked": return "bg-red-500";
      case "not-started": 
      default: return "bg-gray-300";
    }
  };
  
  // Get progress percentage
  const getProgressValue = (status: FeatureStatus) => {
    switch (status) {
      case "completed": return 100;
      case "in-progress": return 50;
      case "waiting-for-approval": return 75;
      case "blocked": return 25;
      case "not-started": 
      default: return 0;
    }
  };
  
  return (
    <div className="border rounded-lg p-3 shadow-sm bg-card">
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-2">
          {icon}
          <h3 className="text-sm font-medium truncate">{title}</h3>
        </div>
        <div className={`h-2 w-2 rounded-full ${getStatusColor(status)}`}></div>
      </div>
      
      <Progress 
        value={getProgressValue(status)} 
        className="h-1.5 mb-3" 
        indicatorColor={getStatusColor(status)}
      />
      
      <div className="flex justify-end">
        <Button 
          onClick={onNavigate} 
          size="sm" 
          variant="ghost" 
          className="h-7 px-2 text-xs"
        >
          {status === "not-started" 
            ? t("assessment.getStarted") 
            : t("assessment.continueAssessment").split(' ')[1]} 
          <ArrowRight className="ml-1 h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}
