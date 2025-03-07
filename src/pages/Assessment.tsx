
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ESGAnalysis } from "@/components/ai/ESGAnalysis";
import { Button } from "@/components/ui/button";
import { 
  Clipboard, FileText, Sparkles, BarChart3, 
  LineChart, Target, AreaChart, Globe 
} from "lucide-react";
import { UserLayout } from "@/components/user/UserLayout";
import { useTranslation } from "react-i18next";

export default function Assessment() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("overview");

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

  const assessmentOptions = [
    {
      id: "rse-diagnostic",
      title: t("assessment.diagnosticRSE.title"),
      description: t("assessment.diagnosticRSE.description"),
      steps: t("assessment.diagnosticRSE.steps"),
      icon: <BarChart3 className="h-12 w-12 text-primary" />,
      buttonText: t("assessment.diagnosticRSE.start"),
      path: "/assessment/rse-diagnostic"
    },
    {
      id: "carbon-evaluation",
      title: t("assessment.carbonEvaluation.title"),
      description: t("assessment.carbonEvaluation.description"),
      steps: t("assessment.carbonEvaluation.steps"),
      icon: <Globe className="h-12 w-12 text-primary" />,
      buttonText: t("assessment.carbonEvaluation.start"),
      path: "/assessment/carbon-evaluation"
    },
    {
      id: "materiality-analysis",
      title: t("assessment.materialityAnalysis.title"),
      description: t("assessment.materialityAnalysis.description"),
      steps: t("assessment.materialityAnalysis.steps"),
      icon: <AreaChart className="h-12 w-12 text-primary" />,
      buttonText: t("assessment.materialityAnalysis.start"),
      path: "/assessment/materiality-analysis"
    },
    {
      id: "action-plan",
      title: t("assessment.actionPlan.title"),
      description: t("assessment.actionPlan.description"),
      steps: t("assessment.actionPlan.steps"),
      icon: <Target className="h-12 w-12 text-primary" />,
      buttonText: t("assessment.actionPlan.start"),
      path: "/assessment/action-plan"
    }
  ];

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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {assessmentOptions.map((option) => (
              <Card key={option.id} className="border-l-4 border-l-primary">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-xl">{option.title}</CardTitle>
                      <CardDescription className="mt-2">{option.description}</CardDescription>
                    </div>
                    <div className="p-2">{option.icon}</div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground">
                    <p className="font-semibold mb-1">Process:</p>
                    <p>{option.steps}</p>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full">{option.buttonText}</Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="ai-analysis" className="pt-6">
          <ESGAnalysis />
        </TabsContent>
      </Tabs>
    </UserLayout>
  );
}
