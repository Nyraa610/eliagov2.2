
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clipboard, Sparkles } from "lucide-react";
import { UserLayout } from "@/components/user/UserLayout";
import { useTranslation } from "react-i18next";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { formSchema, FormValues } from "@/components/assessment/rse-diagnostic/formSchema";
import { FeatureStatus } from "@/types/training";
import { RSEDiagnosticForm } from "@/components/assessment/diagnostic/RSEDiagnosticForm";
import { AssessmentOverview } from "@/components/assessment/overview/AssessmentOverview";
import { AIAssessmentTab } from "@/components/assessment/ai/AIAssessmentTab";

export default function Assessment() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("overview");
  const [activeAssessmentTab, setActiveAssessmentTab] = useState("company-info");
  const [showDiagnostic, setShowDiagnostic] = useState(false);
  const [diagStatus, setDiagStatus] = useState<FeatureStatus>("not-started");

  // Form definition for RSE diagnostic
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      companyName: "",
      industry: "",
      employeeCount: "",
      currentRSEPractices: "",
      mainChallenges: "",
    },
  });

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

  function onSubmit(values: FormValues) {
    console.log(values);
    toast({
      title: "Assessment submitted",
      description: "Your RSE diagnostic has been successfully submitted.",
    });
    // Reset the form and go back to overview
    form.reset();
    setDiagStatus("completed");
    setShowDiagnostic(false);
    setActiveTab("overview");
  }

  // If we're showing the diagnostic form
  if (showDiagnostic) {
    return (
      <UserLayout title={t("assessment.diagnosticRSE.title")}>
        <RSEDiagnosticForm
          form={form}
          activeAssessmentTab={activeAssessmentTab}
          setActiveAssessmentTab={setActiveAssessmentTab}
          onSubmit={onSubmit}
          setShowDiagnostic={setShowDiagnostic}
        />
      </UserLayout>
    );
  }

  // Default assessment options view
  return (
    <UserLayout title={t("assessment.title")}>
      <p className="text-gray-600 mb-6">
        {t("assessment.subtitle")}
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
            showDiagnostic={setShowDiagnostic}
            setDiagStatus={setDiagStatus}
            setActiveAssessmentTab={setActiveAssessmentTab}
            diagStatus={diagStatus}
          />
        </TabsContent>
        
        <TabsContent value="ai-analysis" className="pt-6">
          <AIAssessmentTab />
        </TabsContent>
      </Tabs>
    </UserLayout>
  );
}
