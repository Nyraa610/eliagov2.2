
import { AutomatedValueChainBuilder } from "../../AutomatedValueChainBuilder";
import { AIGenerationPrompt } from "@/types/valueChain";
import { DocumentUploadDialog } from "../../DocumentUploadDialog";

interface DialogManagerProps {
  isUploadDialogOpen: boolean;
  setIsUploadDialogOpen: (open: boolean) => void;
  isAutomatedBuilderOpen: boolean;
  setIsAutomatedBuilderOpen: (open: boolean) => void;
  isGenerating: boolean;
  companyName: string;
  industry: string;
  location: string;
  onDocumentUpload: (files: File[]) => void;
  onAutomatedValueChain: (prompt: AIGenerationPrompt) => Promise<void>;
}

export function DialogManager({
  isUploadDialogOpen,
  setIsUploadDialogOpen,
  isAutomatedBuilderOpen,
  setIsAutomatedBuilderOpen,
  isGenerating,
  companyName,
  industry,
  location,
  onDocumentUpload,
  onAutomatedValueChain
}: DialogManagerProps) {
  return (
    <>
      <AutomatedValueChainBuilder
        open={isAutomatedBuilderOpen}
        onOpenChange={setIsAutomatedBuilderOpen}
        onGenerate={onAutomatedValueChain}
        companyName={companyName}
        industry={industry}
        location={location}
        isGenerating={isGenerating}
      />
      
      <DocumentUploadDialog
        open={isUploadDialogOpen}
        onOpenChange={setIsUploadDialogOpen}
        onUpload={onDocumentUpload}
      />
    </>
  );
}
