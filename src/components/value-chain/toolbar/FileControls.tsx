
import { FileControlsSection } from "./sections/FileControlsSection";

interface FileControlsProps {
  onSave: () => void;
  onExport: () => void;
  onImport: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClear: () => void;
}

export function FileControls(props: FileControlsProps) {
  return <FileControlsSection {...props} />;
}
