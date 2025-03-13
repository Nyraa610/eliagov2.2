
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { FeatureStatus } from "@/types/training";
import { useTranslation } from "react-i18next";
import { ArrowRight } from "lucide-react";

interface CompactStatusCardProps {
  title: string;
  status: FeatureStatus;
  icon: React.ReactNode;
  onNavigate: () => void;
}

export function CompactStatusCard({ title, status, icon, onNavigate }: CompactStatusCardProps) {
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
