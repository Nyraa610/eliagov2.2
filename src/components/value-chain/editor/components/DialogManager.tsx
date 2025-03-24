
import { AutomatedValueChainBuilder } from "../../AutomatedValueChainBuilder";
import { AIGenerationPrompt } from "@/types/valueChain";
import { DocumentUploadDialog } from "../../DocumentUploadDialog";
import { useTranslation } from "react-i18next";

interface DialogManagerProps {
  isUploadDialogOpen: boolean;
  setIsUploadDialogOpen: (open: boolean) => void;
  isAutomatedBuilderOpen: boolean;
  setIsAutomatedBuilderOpen: (open: boolean) => void;
  isGenerating: boolean;
  companyName: string;
  industry: string;
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
  onDocumentUpload,
  onAutomatedValueChain
}: DialogManagerProps) {
  const { t } = useTranslation();

  return (
    <>
      <AutomatedValueChainBuilder
        open={isAutomatedBuilderOpen}
        onOpenChange={setIsAutomatedBuilderOpen}
        onGenerate={onAutomatedValueChain}
        companyName={companyName}
        industry={industry}
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
