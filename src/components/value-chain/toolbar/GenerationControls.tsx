
import { GenerationControlsSection } from "./sections/GenerationControlsSection";

interface GenerationControlsProps {
  onAutomatedBuilder: () => void;
}

export function GenerationControls(props: GenerationControlsProps) {
  return <GenerationControlsSection {...props} />;
}
