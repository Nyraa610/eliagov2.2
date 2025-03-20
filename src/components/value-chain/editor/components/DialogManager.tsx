
import { AIGenerationDialog } from "../../AIGenerationDialog";
import { DocumentUploadDialog } from "../../DocumentUploadDialog";
import { AutomatedValueChainBuilder } from "../../AutomatedValueChainBuilder";
import { AIGenerationPrompt } from "@/types/valueChain";

interface DialogManagerProps {
  isAIDialogOpen: boolean;
  setIsAIDialogOpen: (open: boolean) => void;
  isUploadDialogOpen: boolean;
  setIsUploadDialogOpen: (open: boolean) => void;
  isAutomatedBuilderOpen: boolean;
  setIsAutomatedBuilderOpen: (open: boolean) => void;
  isGenerating: boolean;
  companyName: string;
  industry: string;
  location: string;
  onGenerateWithAI: (prompt: AIGenerationPrompt) => Promise<void>;
  onDocumentUpload: (files: File[]) => void;
  onAutomatedValueChain: (prompt: string, files: File[]) => Promise<void>;
}

export function DialogManager({
  isAIDialogOpen,
  setIsAIDialogOpen,
  isUploadDialogOpen,
  setIsUploadDialogOpen,
  isAutomatedBuilderOpen,
  setIsAutomatedBuilderOpen,
  isGenerating,
  companyName,
  industry,
  location,
  onGenerateWithAI,
  onDocumentUpload,
  onAutomatedValueChain
}: DialogManagerProps) {
  return (
    <>
      <AIGenerationDialog
        open={isAIDialogOpen}
        onOpenChange={setIsAIDialogOpen}
        onGenerate={onGenerateWithAI}
        isGenerating={isGenerating}
      />
      
      <DocumentUploadDialog
        open={isUploadDialogOpen}
        onOpenChange={setIsUploadDialogOpen}
        onUpload={onDocumentUpload}
      />
      
      <AutomatedValueChainBuilder
        open={isAutomatedBuilderOpen}
        onOpenChange={setIsAutomatedBuilderOpen}
        onGenerate={onAutomatedValueChain}
        companyName={companyName}
        industry={industry}
        location={location}
      />
    </>
  );
}
