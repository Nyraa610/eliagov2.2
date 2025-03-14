import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clipboard, Sparkles } from "lucide-react";
import { UserLayout } from "@/components/user/UserLayout";
import { useTranslation } from "react-i18next";
import { FeatureStatus } from "@/types/training";
import { AssessmentOverview } from "@/components/assessment/overview/AssessmentOverview";
import { AIAssessmentTab } from "@/components/assessment/ai/AIAssessmentTab";

export default function Assessment() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("overview");
  const [diagStatus, setDiagStatus] = useState<FeatureStatus>("not-started");
  const [showDiagnostic, setShowDiagnostic] = useState(false);

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

  const setActiveAssessmentTab = (tab: string) => {
    setActiveTab(tab);
  };

  const handleShowDiagnostic = (show: boolean) => {
    setShowDiagnostic(show);
  };

  return (
    <UserLayout title={t("assessment.title")}>
      <p className="text-gray-600 mb-6">
        Complete your company's ESG/RSE diagnostic with the help of Elia, our AI assistant.
      </p>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="overview">
            <Clipboard className="mr-2 h-4 w-4" />
            {t("assessment.form")}
          </TabsTrigger>
          <TabsTrigger value="ai-analysis">
            <Sparkles className="mr-2 h-4 w-4" />
            {t("assessment.aiAnalysis")}
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="pt-6">
          <AssessmentOverview 
            diagStatus={diagStatus}
            setDiagStatus={setDiagStatus}
            showDiagnostic={showDiagnostic}
            setShowDiagnostic={handleShowDiagnostic}
            setActiveAssessmentTab={setActiveAssessmentTab}
          />
        </TabsContent>
        
        <TabsContent value="ai-analysis" className="pt-6">
          <AIAssessmentTab />
        </TabsContent>
      </Tabs>
    </UserLayout>
  );
}
