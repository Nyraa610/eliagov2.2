
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { FeatureStatus } from "@/types/training";
import { useTranslation } from "react-i18next";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

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

  // Get animation based on status
  const getAnimation = (status: FeatureStatus) => {
    if (status === "completed") {
      return {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        transition: { duration: 0.5 },
        className: "relative after:absolute after:inset-0 after:bg-gradient-to-r after:from-green-500/10 after:to-transparent after:animate-pulse after:rounded-lg"
      };
    }
    if (status === "in-progress") {
      return {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        transition: { duration: 0.5 },
        className: "relative after:absolute after:inset-0 after:bg-gradient-to-r after:from-blue-500/10 after:to-transparent after:animate-pulse after:rounded-lg"
      };
    }
    return {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      transition: { duration: 0.5 },
      className: ""
    };
  };
  
  const animation = getAnimation(status);
  
  return (
    <motion.div
      initial={animation.initial}
      animate={animation.animate}
      transition={animation.transition}
      whileHover={{ scale: 1.02, boxShadow: "0 4px 6px rgba(0,0,0,0.1)" }}
      className={`border rounded-lg p-3 shadow-sm bg-card ${animation.className}`}
    >
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
        <motion.div whileHover={{ x: 3 }} whileTap={{ scale: 0.95 }}>
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
        </motion.div>
      </div>
    </motion.div>
  );
}
