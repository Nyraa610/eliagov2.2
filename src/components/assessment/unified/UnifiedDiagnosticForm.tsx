
import { Tabs } from "@/components/ui/tabs";
import { ESGFormValues } from "../esg-diagnostic/ESGFormSchema";
import { UnifiedFormProvider } from "./context/UnifiedFormContext";
import { useUnifiedFormSubmission } from "./hooks/useUnifiedFormSubmission";
import { UnifiedFormTabs } from "./components/UnifiedFormTabs";
import { UnifiedFormContent } from "./components/UnifiedFormContent";

interface UnifiedDiagnosticFormProps {
  onSubmit: (values: ESGFormValues) => void;
  onAnalysisComplete: (analysisResult: string) => void;
}

export function UnifiedDiagnosticForm({ onSubmit, onAnalysisComplete }: UnifiedDiagnosticFormProps) {
  const {
    form,
    isSubmitting,
    userCompany,
    activeTab,
    handleTabChange,
    handleFormSubmit
  } = useUnifiedFormSubmission(onSubmit, onAnalysisComplete);

  return (
    <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
      <UnifiedFormTabs onValueChange={handleTabChange} />
      
      <UnifiedFormProvider value={{
        form,
        isSubmitting,
        userCompany,
        onTabChange: handleTabChange,
        onSubmit: handleFormSubmit
      }}>
        <UnifiedFormContent />
      </UnifiedFormProvider>
    </Tabs>
  );
}
