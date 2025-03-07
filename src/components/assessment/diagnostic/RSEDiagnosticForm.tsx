
import { useState } from "react";
import { AssessmentBase } from "@/components/assessment/AssessmentBase";
import { useTranslation } from "react-i18next";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { LineChart } from "lucide-react";
import { Form } from "@/components/ui/form";
import { UseFormReturn } from "react-hook-form";
import { FormValues } from "@/components/assessment/rse-diagnostic/formSchema";
import { DiagnosticTabs } from "@/components/assessment/rse-diagnostic/DiagnosticTabs";
import { CompanyInfoForm } from "@/components/assessment/rse-diagnostic/CompanyInfoForm";
import { CurrentPracticesForm } from "@/components/assessment/rse-diagnostic/CurrentPracticesForm";
import { StakeholdersForm } from "@/components/assessment/rse-diagnostic/StakeholdersForm";
import { ChallengesForm } from "@/components/assessment/rse-diagnostic/ChallengesForm";

interface RSEDiagnosticFormProps {
  form: UseFormReturn<FormValues>;
  activeAssessmentTab: string;
  setActiveAssessmentTab: (tab: string) => void;
  onSubmit: (values: FormValues) => void;
  setShowDiagnostic: (show: boolean) => void;
}

export function RSEDiagnosticForm({
  form,
  activeAssessmentTab,
  setActiveAssessmentTab,
  onSubmit,
  setShowDiagnostic
}: RSEDiagnosticFormProps) {
  const { t } = useTranslation();

  return (
    <>
      <div className="mb-6">
        <Button 
          variant="link" 
          className="text-primary hover:underline flex items-center p-0 mb-4" 
          onClick={() => setShowDiagnostic(false)}
        >
          <LineChart className="h-4 w-4 mr-1" /> {t("assessment.backToOptions")}
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
    </>
  );
}
