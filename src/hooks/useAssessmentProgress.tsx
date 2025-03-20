
import { useState, useEffect } from "react";
import { FeatureStatus } from "@/types/training";
import { assessmentService, AssessmentType } from "@/services/assessmentService";

export function useAssessmentProgress() {
  const [diagStatus, setDiagStatus] = useState<FeatureStatus>("not-started");
  const [carbonEvalStatus, setCarbonEvalStatus] = useState<FeatureStatus>("not-started");
  const [materialityStatus, setMaterialityStatus] = useState<FeatureStatus>("not-started");
  const [actionPlanStatus, setActionPlanStatus] = useState<FeatureStatus>("not-started");
  const [iroStatus, setIroStatus] = useState<FeatureStatus>("not-started");
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

        const iroProgress = await assessmentService.getAssessmentProgress('iro_analysis');
        if (iroProgress) {
          setIroStatus(iroProgress.status as FeatureStatus);
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
                  statusValues[actionPlanStatus] +
                  statusValues[iroStatus];
    
    return Math.round((total / 5) * 100);
  };

  return {
    diagStatus,
    setDiagStatus,
    carbonEvalStatus,
    setCarbonEvalStatus,
    materialityStatus,
    setMaterialityStatus,
    actionPlanStatus,
    setActionPlanStatus,
    iroStatus,
    setIroStatus,
    loading,
    getOverallProgress
  };
}
