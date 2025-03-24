
import { Tabs } from "@/components/ui/tabs";
import { ESGFormValues } from "../esg-diagnostic/ESGFormSchema";
import { UnifiedFormProvider } from "./context/UnifiedFormContext";
import { useUnifiedFormSubmission } from "./hooks/useUnifiedFormSubmission";
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
    handleFormSubmit,
    formProgress
  } = useUnifiedFormSubmission(onSubmit, onAnalysisComplete);

  // Define the steps
  const steps = ["company", "environmental", "social", "governance", "review"];

  return (
    <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
      <UnifiedFormProvider value={{
        form,
        isSubmitting,
        userCompany,
        activeTab,
        setActiveTab: handleTabChange,
        steps,
        formProgress,
        handleSubmit: handleFormSubmit,
        onTabChange: handleTabChange,
        onSubmit: handleFormSubmit
      }}>
        <UnifiedFormContent />
      </UnifiedFormProvider>
    </Tabs>
  );
}
