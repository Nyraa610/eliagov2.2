
import { useState } from "react";
import { UserLayout } from "@/components/user/UserLayout";
import { AssessmentBase } from "@/components/assessment/AssessmentBase";
import { useTranslation } from "react-i18next";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Form } from "@/components/ui/form";

// Import form schema
import { formSchema, FormValues } from "@/components/assessment/rse-diagnostic/formSchema";

// Import the new components
import { DiagnosticTabs } from "@/components/assessment/rse-diagnostic/DiagnosticTabs";
import { CompanyInfoForm } from "@/components/assessment/rse-diagnostic/CompanyInfoForm";
import { CurrentPracticesForm } from "@/components/assessment/rse-diagnostic/CurrentPracticesForm";
import { StakeholdersForm } from "@/components/assessment/rse-diagnostic/StakeholdersForm";
import { ChallengesForm } from "@/components/assessment/rse-diagnostic/ChallengesForm";

export default function RSEDiagnostic() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("company-info");
  
  // Form definition
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

  function onSubmit(values: FormValues) {
    console.log(values);
    // Here we would save the data and potentially navigate to the next step
  }

  return (
    <UserLayout title={t("assessment.diagnosticRSE.title")}>
      <div className="mb-6">
        <Link to="/assessment" className="text-primary hover:underline flex items-center mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to Assessment
        </Link>
        <p className="text-gray-600">
          {t("assessment.diagnosticRSE.description")}
        </p>
      </div>
      
      <AssessmentBase 
        title={t("assessment.diagnosticRSE.title")} 
        description={t("assessment.diagnosticRSE.description")}
        status="in-progress"
      >
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <DiagnosticTabs activeTab={activeTab} />
          
          <TabsContent value="company-info" className="space-y-4">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <CompanyInfoForm 
                  form={form} 
                  onNext={() => setActiveTab("practices")} 
                />
              </form>
            </Form>
          </TabsContent>
          
          <TabsContent value="practices" className="space-y-4">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <CurrentPracticesForm 
                  form={form} 
                  onNext={() => setActiveTab("stakeholders")}
                  onPrev={() => setActiveTab("company-info")}
                />
              </form>
            </Form>
          </TabsContent>
          
          <TabsContent value="stakeholders" className="space-y-4">
            <StakeholdersForm 
              onNext={() => setActiveTab("challenges")}
              onPrev={() => setActiveTab("practices")}
            />
          </TabsContent>
          
          <TabsContent value="challenges" className="space-y-4">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <ChallengesForm 
                  form={form} 
                  onPrev={() => setActiveTab("stakeholders")}
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
