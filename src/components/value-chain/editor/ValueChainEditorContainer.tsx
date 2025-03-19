
import { useRef, useState } from "react";
import { ReactFlowProvider } from "@xyflow/react";
import { ValueChainData, AIGenerationPrompt } from "@/types/valueChain";
import { useCompanyProfile } from "@/hooks/useCompanyProfile";
import { NodeEditPanel } from "../NodeEditPanel";
import { ValueChainToolbar } from "../ValueChainToolbar";
import { AIGenerationDialog } from "../AIGenerationDialog";
import { ReactFlowCanvas } from "./ReactFlowCanvas";
import { useValueChainNodes } from "./useValueChainNodes";
import { useValueChainActions } from "./useValueChainActions";

// Import react-flow styles
import "@xyflow/react/dist/style.css";
import "@/styles/value-chain.css";

interface ValueChainEditorContainerProps {
  initialData?: ValueChainData;
}

export function ValueChainEditorContainer({ initialData }: ValueChainEditorContainerProps) {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [isAIDialogOpen, setIsAIDialogOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const { company } = useCompanyProfile();

  const {
    nodes,
    edges,
    selectedNode,
    setSelectedNode,
    onNodesChange,
    onEdgesChange,
    onNodeClick,
    handleUpdateNode,
    handleAddNode,
    setNodes,
    setEdges
  } = useValueChainNodes(initialData);

  const {
    handleSave,
    handleExport,
    handleImport,
    handleClear,
    handleZoomIn,
    handleZoomOut,
    handleReset,
    handleGenerateAI
  } = useValueChainActions({
    nodes,
    edges,
    setNodes,
    setEdges,
    setSelectedNode,
    company
  });

  const onGenerateWithAI = async (prompt: AIGenerationPrompt) => {
    return handleGenerateAI(prompt, setIsGenerating, setIsAIDialogOpen);
  };

  return (
    <div className="h-[calc(100vh-200px)] min-h-[800px]">
      <div className="mb-4">
        <ValueChainToolbar
          onAddNode={handleAddNode}
          onSave={handleSave}
          onExport={handleExport}
          onImport={handleImport}
          onClear={handleClear}
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onReset={handleReset}
          onGenerateAI={() => setIsAIDialogOpen(true)}
        />
      </div>
      
      <div className="flex gap-4 h-full">
        <div ref={reactFlowWrapper} className="flex-1 border rounded-lg overflow-hidden">
          <ReactFlowProvider>
            <ReactFlowCanvas
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onNodeClick={onNodeClick}
            />
          </ReactFlowProvider>
        </div>
        
        {selectedNode && (
          <div className="w-96">
            <NodeEditPanel
              selectedNode={selectedNode}
              onUpdate={handleUpdateNode}
              onClose={() => setSelectedNode(null)}
            />
          </div>
        )}
      </div>
      
      <AIGenerationDialog
        open={isAIDialogOpen}
        onOpenChange={setIsAIDialogOpen}
        onGenerate={onGenerateWithAI}
        isGenerating={isGenerating}
        companyName={company?.name || ''}
        industry={company?.industry || ''}
      />
    </div>
  );
}
