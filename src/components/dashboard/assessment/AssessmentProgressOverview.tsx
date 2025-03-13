
import { Progress } from "@/components/ui/progress";
import { useTranslation } from "react-i18next";

interface AssessmentProgressOverviewProps {
  progress: number;
}

export function AssessmentProgressOverview({ progress }: AssessmentProgressOverviewProps) {
  const { t } = useTranslation();
  
  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium">{t('dashboard.overallProgress')}</span>
        <span className="text-sm text-muted-foreground">{progress}%</span>
      </div>
      <Progress value={progress} className="h-2" />
    </div>
  );
}
