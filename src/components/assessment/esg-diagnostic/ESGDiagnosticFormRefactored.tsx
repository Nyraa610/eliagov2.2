
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form } from "@/components/ui/form";
import { Building2, Leaf, Users, ShieldCheck, FileCheck } from "lucide-react";
import { ESGFormValues } from "./ESGFormSchema";
import { CompanyContextForm } from "./CompanyContextForm";
import { EnvironmentalForm } from "./EnvironmentalForm";
import { SocialForm } from "./SocialForm";
import { GovernanceForm } from "./GovernanceForm";
import { GoalsForm } from "./GoalsForm";
import { FormProvider } from "./context/FormContext";
import { useFormSubmission } from "./hooks/useFormSubmission";

interface ESGDiagnosticFormProps {
  onSubmit: (values: ESGFormValues) => void;
  onAnalysisComplete: (analysisResult: string) => void;
}

export function ESGDiagnosticFormRefactored({ onSubmit, onAnalysisComplete }: ESGDiagnosticFormProps) {
  const {
    form,
    isSubmitting,
    userCompany,
    activeTab,
    handleTabChange,
    handleFormSubmit
  } = useFormSubmission(onSubmit, onAnalysisComplete);

  const navigateToTab = (tab: string) => {
    handleTabChange(tab);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>ESG Diagnostic Assessment</CardTitle>
        <CardDescription>
          Complete this assessment to evaluate your company's Environmental, Social, and Governance practices
          {userCompany && (
            <div className="mt-2 text-sm font-medium text-primary">
              Assessment for: {userCompany}
            </div>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid grid-cols-5 mb-4">
            <TabsTrigger value="company" className="flex items-center gap-1">
              <Building2 className="h-4 w-4" /> Company
            </TabsTrigger>
            <TabsTrigger value="environmental" className="flex items-center gap-1">
              <Leaf className="h-4 w-4" /> Environmental
            </TabsTrigger>
            <TabsTrigger value="social" className="flex items-center gap-1">
              <Users className="h-4 w-4" /> Social
            </TabsTrigger>
            <TabsTrigger value="governance" className="flex items-center gap-1">
              <ShieldCheck className="h-4 w-4" /> Governance
            </TabsTrigger>
            <TabsTrigger value="goals" className="flex items-center gap-1">
              <FileCheck className="h-4 w-4" /> Goals
            </TabsTrigger>
          </TabsList>
          
          <FormProvider value={{
            form,
            isSubmitting,
            userCompany,
            onTabChange: navigateToTab,
            onSubmit: handleFormSubmit
          }}>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleFormSubmit)}>
                <TabsContent value="company" className="space-y-4 pt-4">
                  <CompanyContextForm 
                    form={form} 
                    onNext={() => navigateToTab("environmental")} 
                  />
                </TabsContent>
                
                <TabsContent value="environmental" className="space-y-4 pt-4">
                  <EnvironmentalForm 
                    form={form} 
                    onNext={() => navigateToTab("social")} 
                    onPrev={() => navigateToTab("company")} 
                  />
                </TabsContent>
                
                <TabsContent value="social" className="space-y-4 pt-4">
                  <SocialForm 
                    form={form} 
                    onNext={() => navigateToTab("governance")} 
                    onPrev={() => navigateToTab("environmental")} 
                  />
                </TabsContent>
                
                <TabsContent value="governance" className="space-y-4 pt-4">
                  <GovernanceForm 
                    form={form} 
                    onNext={() => navigateToTab("goals")} 
                    onPrev={() => navigateToTab("social")} 
                  />
                </TabsContent>
                
                <TabsContent value="goals" className="space-y-4 pt-4">
                  <GoalsForm 
                    form={form} 
                    onPrev={() => navigateToTab("governance")}
                    isSubmitting={isSubmitting}
                  />
                </TabsContent>
              </form>
            </Form>
          </FormProvider>
        </Tabs>
      </CardContent>
    </Card>
  );
}
