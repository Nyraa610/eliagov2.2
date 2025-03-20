
import { ViewControlsSection } from "./sections/ViewControlsSection";

interface ViewControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
}

export function ViewControls(props: ViewControlsProps) {
  return <ViewControlsSection {...props} />;
}
