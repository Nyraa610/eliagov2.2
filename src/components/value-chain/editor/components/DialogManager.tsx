
import { AutomatedValueChainBuilder } from "../../AutomatedValueChainBuilder";
import { AIGenerationPrompt } from "@/types/valueChain";
import { DocumentUploadDialog } from "../../DocumentUploadDialog";
import { useTranslation } from "react-i18next";
import { GamificationFeedback } from "@/components/assessment/unified/GamificationFeedback";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";

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
  const [showCelebration, setShowCelebration] = useState(false);
  const { celebrateSuccess } = useToast();

  // Handle successful generation
  const handleSuccessfulGeneration = async (prompt: AIGenerationPrompt) => {
    try {
      await onAutomatedValueChain(prompt);
      setShowCelebration(true);
      celebrateSuccess(
        "Value Chain Generated!",
        "Your value chain has been successfully generated with AI"
      );
    } catch (error) {
      console.error("Error generating value chain:", error);
    }
  };

  return (
    <>
      <AutomatedValueChainBuilder
        open={isAutomatedBuilderOpen}
        onOpenChange={setIsAutomatedBuilderOpen}
        onGenerate={handleSuccessfulGeneration}
        companyName={companyName}
        industry={industry}
        isGenerating={isGenerating}
      />
      
      <DocumentUploadDialog
        open={isUploadDialogOpen}
        onOpenChange={setIsUploadDialogOpen}
        onUpload={onDocumentUpload}
      />

      {/* Celebration feedback when value chain is generated */}
      <GamificationFeedback
        type="milestone"
        message="Your value chain has been successfully created! This is a major milestone in understanding your business processes."
        show={showCelebration}
        points={25}
        onAnimationComplete={() => setShowCelebration(false)}
      />
    </>
  );
}
