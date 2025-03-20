
import { NodeTypeButtonsSection } from "./sections/NodeTypeButtonsSection";
import { NodeType } from "@/types/valueChain";

interface NodeTypeButtonsProps {
  onAddNode: (type: NodeType) => void;
}

export function NodeTypeButtons(props: NodeTypeButtonsProps) {
  return <NodeTypeButtonsSection {...props} />;
}
