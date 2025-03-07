
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { BarChart3 } from "lucide-react";
import { AssessmentBase } from "@/components/assessment/AssessmentBase";
import { useTranslation } from "react-i18next";
import { FeatureStatus } from "@/types/training";

interface AssessmentOverviewProps {
  showDiagnostic: (value: boolean) => void;
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
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
      <AssessmentBase 
        title={t("assessment.diagnosticRSE.title")} 
        description={t("assessment.diagnosticRSE.description")}
        status={diagStatus}
      >
        <div className="p-4">
          <p className="text-muted-foreground mb-6">
            {t("assessment.diagnosticRSE.steps")}
          </p>
          <Button 
            className="w-full" 
            onClick={() => {
              showDiagnostic(true);
              setDiagStatus("in-progress");
              setActiveAssessmentTab("company-info");
            }}
          >
            <BarChart3 className="mr-2 h-5 w-5" />
            {t("assessment.diagnosticRSE.start")}
          </Button>
        </div>
      </AssessmentBase>
    </div>
  );
}
