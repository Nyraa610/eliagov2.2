
import { ESGFormValues } from "./ESGFormSchema";
import { ESGDiagnosticFormRefactored } from "./ESGDiagnosticFormRefactored";

interface ESGDiagnosticFormProps {
  onSubmit: (values: ESGFormValues) => void;
  onAnalysisComplete: (analysisResult: string) => void;
}

export function ESGDiagnosticForm({ onSubmit, onAnalysisComplete }: ESGDiagnosticFormProps) {
  return (
    <ESGDiagnosticFormRefactored
      onSubmit={onSubmit}
      onAnalysisComplete={onAnalysisComplete}
    />
  );
}
