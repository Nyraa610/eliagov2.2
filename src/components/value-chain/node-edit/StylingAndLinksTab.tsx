
import { ColorPicker } from "./ColorPicker";
import { ConnectionControls } from "./ConnectionControls";

interface StylingAndLinksTabProps {
  nodeId: string;
  initialColor: string;
  onColorChange: (color: string) => void;
}

export function StylingAndLinksTab({ 
  nodeId, 
  initialColor,
  onColorChange
}: StylingAndLinksTabProps) {
  return (
    <>
      <ColorPicker initialColor={initialColor} onColorChange={onColorChange} />
      <ConnectionControls nodeId={nodeId} />
    </>
  );
}
