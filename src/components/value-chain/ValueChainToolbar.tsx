
import { Card, CardContent } from "@/components/ui/card";
import { TooltipProvider } from "@/components/ui/tooltip";
import { NodeType } from "@/types/valueChain";
import { ToolbarSection } from "./toolbar/ToolbarSection";
import { NodeTypeButtonsSection } from "./toolbar/sections/NodeTypeButtonsSection";
import { ViewControlsSection } from "./toolbar/sections/ViewControlsSection";
import { GenerationControlsSection } from "./toolbar/sections/GenerationControlsSection";
import { FileControlsSection } from "./toolbar/sections/FileControlsSection";

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
              <NodeTypeButtonsSection onAddNode={onAddNode} />
            </ToolbarSection>
            
            <ToolbarSection withSeparator>
              <ViewControlsSection 
                onZoomIn={onZoomIn}
                onZoomOut={onZoomOut}
                onReset={onReset}
              />
            </ToolbarSection>
            
            <ToolbarSection withSeparator>
              <GenerationControlsSection
                onGenerateAI={onGenerateAI}
                onUploadDocuments={onUploadDocuments}
                onAutomatedBuilder={onAutomatedBuilder}
              />
            </ToolbarSection>
            
            <div className="flex-1"></div>
            
            <ToolbarSection withSeparator={false}>
              <FileControlsSection
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
