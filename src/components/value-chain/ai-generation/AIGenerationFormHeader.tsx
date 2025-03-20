
import { DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export function AIGenerationFormHeader() {
  return (
    <DialogHeader>
      <DialogTitle>Generate Value Chain with AI</DialogTitle>
      <DialogDescription>
        Provide information about your company to generate a detailed value chain model optimized for ESG reporting.
      </DialogDescription>
    </DialogHeader>
  );
}
