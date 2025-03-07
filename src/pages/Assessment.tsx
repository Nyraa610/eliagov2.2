
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ESGAnalysis } from "@/components/ai/ESGAnalysis";
import { Button } from "@/components/ui/button";
import { 
  Clipboard, Sparkles, BarChart3, 
  LineChart, Target, AreaChart, Globe 
} from "lucide-react";
import { UserLayout } from "@/components/user/UserLayout";
import { useTranslation } from "react-i18next";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";
import { AssessmentBase } from "@/components/assessment/AssessmentBase";
import { DiagnosticTabs } from "@/components/assessment/rse-diagnostic/DiagnosticTabs";
import { CompanyInfoForm } from "@/components/assessment/rse-diagnostic/CompanyInfoForm";
import { CurrentPracticesForm } from "@/components/assessment/rse-diagnostic/CurrentPracticesForm";
import { StakeholdersForm } from "@/components/assessment/rse-diagnostic/StakeholdersForm";
import { ChallengesForm } from "@/components/assessment/rse-diagnostic/ChallengesForm";
import { formSchema, FormValues } from "@/components/assessment/rse-diagnostic/formSchema";
import { FeatureStatus } from "@/types/training";

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
        <div className="mb-6">
          <Button 
            variant="link" 
            className="text-primary hover:underline flex items-center p-0 mb-4" 
            onClick={() => setShowDiagnostic(false)}
          >
            <LineChart className="h-4 w-4 mr-1" /> Back to Assessment Options
          </Button>
          <p className="text-gray-600">
            {t("assessment.diagnosticRSE.description")}
          </p>
        </div>
        
        <AssessmentBase 
          title={t("assessment.diagnosticRSE.title")} 
          description={t("assessment.diagnosticRSE.description")}
          status="in-progress"
        >
          <Tabs value={activeAssessmentTab} onValueChange={setActiveAssessmentTab} className="w-full">
            <DiagnosticTabs activeTab={activeAssessmentTab} />
            
            <TabsContent value="company-info" className="space-y-4">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <CompanyInfoForm 
                    form={form} 
                    onNext={() => setActiveAssessmentTab("practices")} 
                  />
                </form>
              </Form>
            </TabsContent>
            
            <TabsContent value="practices" className="space-y-4">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <CurrentPracticesForm 
                    form={form} 
                    onNext={() => setActiveAssessmentTab("stakeholders")}
                    onPrev={() => setActiveAssessmentTab("company-info")}
                  />
                </form>
              </Form>
            </TabsContent>
            
            <TabsContent value="stakeholders" className="space-y-4">
              <StakeholdersForm 
                onNext={() => setActiveAssessmentTab("challenges")}
                onPrev={() => setActiveAssessmentTab("practices")}
              />
            </TabsContent>
            
            <TabsContent value="challenges" className="space-y-4">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <ChallengesForm 
                    form={form} 
                    onPrev={() => setActiveAssessmentTab("stakeholders")}
                    onSubmit={form.handleSubmit(onSubmit)}
                  />
                </form>
              </Form>
            </TabsContent>
          </Tabs>
        </AssessmentBase>
      </UserLayout>
    );
  }

  // Default assessment options view - we'll show only the RSE Diagnostic option
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
                    setShowDiagnostic(true);
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
        </TabsContent>
        
        <TabsContent value="ai-analysis" className="pt-6">
          <ESGAnalysis />
        </TabsContent>
      </Tabs>
    </UserLayout>
  );
}
