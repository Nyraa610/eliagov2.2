
import { Form } from "@/components/ui/form";
import { TabsContent } from "@/components/ui/tabs";
import { CompanyContextForm } from "../../esg-diagnostic/CompanyContextForm";
import { EnvironmentalForm } from "../../esg-diagnostic/EnvironmentalForm";
import { SocialForm } from "../../esg-diagnostic/SocialForm";
import { GovernanceForm } from "../../esg-diagnostic/GovernanceForm";
import { GoalsForm } from "../../esg-diagnostic/GoalsForm";
import { useUnifiedFormContext } from "../context/UnifiedFormContext";

export function UnifiedFormContent() {
  const { form, isSubmitting, onTabChange, onSubmit } = useUnifiedFormContext();

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <TabsContent value="company" className="space-y-4 pt-4">
          <CompanyContextForm 
            form={form} 
            onNext={() => onTabChange("environmental")} 
          />
        </TabsContent>
        
        <TabsContent value="environmental" className="space-y-4 pt-4">
          <EnvironmentalForm 
            form={form} 
            onNext={() => onTabChange("social")} 
            onPrev={() => onTabChange("company")} 
          />
        </TabsContent>
        
        <TabsContent value="social" className="space-y-4 pt-4">
          <SocialForm 
            form={form} 
            onNext={() => onTabChange("governance")} 
            onPrev={() => onTabChange("environmental")} 
          />
        </TabsContent>
        
        <TabsContent value="governance" className="space-y-4 pt-4">
          <GovernanceForm 
            form={form} 
            onNext={() => onTabChange("goals")} 
            onPrev={() => onTabChange("social")} 
          />
        </TabsContent>
        
        <TabsContent value="goals" className="space-y-4 pt-4">
          <GoalsForm 
            form={form} 
            onPrev={() => onTabChange("governance")}
            isSubmitting={isSubmitting}
          />
        </TabsContent>
      </form>
    </Form>
  );
}
