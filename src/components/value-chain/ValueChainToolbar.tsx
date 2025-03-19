
import { Card, CardContent } from "@/components/ui/card";
import { TooltipProvider } from "@/components/ui/tooltip";
import { NodeType } from "@/types/valueChain";
import { NodeTypeButtons } from "./toolbar/NodeTypeButtons";
import { ViewControls } from "./toolbar/ViewControls";
import { GenerationControls } from "./toolbar/GenerationControls";
import { FileControls } from "./toolbar/FileControls";
import { ToolbarSection } from "./toolbar/ToolbarSection";

interface ValueChainToolbarProps {
  onAddNode: (type: NodeType) => void;
  onSave: () => void;
  onExport: () => void;
  onImport: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClear: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
  onGenerateAI: () => void;
  onUploadDocuments: () => void;
  onAutomatedBuilder: () => void;
}

export function ValueChainToolbar({
  onAddNode,
  onSave,
  onExport,
  onImport,
  onClear,
  onZoomIn,
  onZoomOut,
  onReset,
  onGenerateAI,
  onUploadDocuments,
  onAutomatedBuilder
}: ValueChainToolbarProps) {
  return (
    <TooltipProvider>
      <Card className="w-full">
        <CardContent className="p-3">
          <div className="flex items-center gap-2 flex-wrap">
            <ToolbarSection withSeparator>
              <NodeTypeButtons onAddNode={onAddNode} />
            </ToolbarSection>
            
            <ToolbarSection withSeparator>
              <ViewControls 
                onZoomIn={onZoomIn}
                onZoomOut={onZoomOut}
                onReset={onReset}
              />
            </ToolbarSection>
            
            <ToolbarSection withSeparator>
              <GenerationControls
                onGenerateAI={onGenerateAI}
                onUploadDocuments={onUploadDocuments}
                onAutomatedBuilder={onAutomatedBuilder}
              />
            </ToolbarSection>
            
            <div className="flex-1"></div>
            
            <ToolbarSection withSeparator={false}>
              <FileControls
                onSave={onSave}
                onExport={onExport}
                onImport={onImport}
                onClear={onClear}
              />
            </ToolbarSection>
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}
