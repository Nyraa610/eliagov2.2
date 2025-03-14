
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";
import { UserLayout } from "@/components/user/UserLayout";
import { useTranslation } from "react-i18next";
import { FeatureStatus } from "@/types/training";
import { AssessmentOverview } from "@/components/assessment/overview/AssessmentOverview";
import { TrainingModuleInvitation } from "@/components/assessment/overview/TrainingModuleInvitation";
import { EliaAssistant } from "@/components/assessment/unified/EliaAssistant";
import { UnifiedESGAnalysis } from "@/components/assessment/unified/UnifiedESGAnalysis";
import { useAssessmentProgress } from "@/hooks/useAssessmentProgress";
import { ESGAssessmentHistory } from "@/components/assessment/esg-diagnostic/ESGAssessmentHistory";

export default function Assessment() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();
  const { diagStatus, setDiagStatus, loading, getOverallProgress } = useAssessmentProgress();
  const [showDiagnostic, setShowDiagnostic] = useState(false);
  const [showUnifiedAssessment, setShowUnifiedAssessment] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Authentication required",
          description: "Please sign in to access the assessment.",
        });
        navigate("/register");
      }
    };

    checkAuth();
  }, [navigate, toast]);

  const handleShowDiagnostic = (show: boolean) => {
    setShowDiagnostic(show);
    // When showing the diagnostic, we want to show the unified assessment
    if (show) {
      setShowUnifiedAssessment(true);
      setShowHistory(false);
    }
  };

  const handleShowHistory = () => {
    setShowHistory(true);
    setShowUnifiedAssessment(false);
  };

  const handleStartNewAssessment = () => {
    setShowUnifiedAssessment(true);
    setShowHistory(false);
    // Reset diagnostic status to in-progress for new assessment
    if (diagStatus === "completed") {
      setDiagStatus("in-progress");
    }
  };

  return (
    <UserLayout title={t("assessment.title")}>
      <p className="text-gray-600 mb-6">
        Complete your company's ESG/RSE assessment with the help of Elia, our AI assistant.
      </p>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <TrainingModuleInvitation />
          
          {!showUnifiedAssessment && !showHistory ? (
            <AssessmentOverview 
              diagStatus={diagStatus}
              setDiagStatus={setDiagStatus}
              showDiagnostic={handleShowDiagnostic}
              setActiveAssessmentTab={() => {}}
              onViewHistory={handleShowHistory}
            />
          ) : showHistory ? (
            <>
              <ESGAssessmentHistory onStartNew={handleStartNewAssessment} />
            </>
          ) : (
            <UnifiedESGAnalysis />
          )}
        </div>
        
        <div className="lg:col-span-1">
          <div className="sticky top-24">
            <EliaAssistant />
          </div>
        </div>
      </div>
    </UserLayout>
  );
}
