
import { GenerationControlsSection } from "./sections/GenerationControlsSection";

interface GenerationControlsProps {
  onGenerateAI: () => void;
  onUploadDocuments: () => void;
  onAutomatedBuilder: () => void;
}

export function GenerationControls(props: GenerationControlsProps) {
  return <GenerationControlsSection {...props} />;
}
