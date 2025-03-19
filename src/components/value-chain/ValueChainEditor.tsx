
import { ValueChainData } from "@/types/valueChain";
import { ValueChainEditorContainer } from "./editor/ValueChainEditorContainer";

interface ValueChainEditorProps {
  initialData?: ValueChainData | null;
}

export function ValueChainEditor({ initialData }: ValueChainEditorProps) {
  return <ValueChainEditorContainer initialData={initialData as ValueChainData} />;
}
