
import { ReactFlowCanvas } from "../ReactFlowCanvas";
import { EmptyStateGuide } from "./EmptyStateGuide";
import { GenerationProgressBar } from "./GenerationProgressBar";
import { EditorLayout } from "./EditorLayout";
import { ValueChainToolbar } from "../../ValueChainToolbar";
import { NodeEditPanel } from "../../NodeEditPanel";
import { useRef } from "react";

interface EditorContentProps {
  nodes: any[];
  edges: any[];
  onNodesChange: any;
  onEdgesChange: any;
  onNodeClick: any;
  selectedNode: any;
  handleUpdateNode: any;
  handleAddNode: any;
  handleSave: any;
  handleExport: any;
  handleImport: any;
  handleClear: any;
  handleZoomIn: any;
  handleZoomOut: any;
  handleReset: any;
  isGenerating: boolean;
  generatingProgress: number;
  onGenerateAI: () => void;
  onUploadDocuments: () => void;
  onAutomatedBuilder: () => void;
  setSelectedNode: (node: any) => void;
}

export function EditorContent({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onNodeClick,
  selectedNode,
  handleUpdateNode,
  handleAddNode,
  handleSave,
  handleExport,
  handleImport,
  handleClear,
  handleZoomIn,
  handleZoomOut,
  handleReset,
  isGenerating,
  generatingProgress,
  onGenerateAI,
  onUploadDocuments,
  onAutomatedBuilder,
  setSelectedNode
}: EditorContentProps) {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);

  return (
    <>
      {!nodes.length && !isGenerating && (
        <EmptyStateGuide
          onOpenAIDialog={onGenerateAI}
          onOpenAutomatedBuilder={onAutomatedBuilder}
          onOpenUploadDialog={onUploadDocuments}
        />
      )}
      
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
          onGenerateAI={onGenerateAI}
          onUploadDocuments={onUploadDocuments}
          onAutomatedBuilder={onAutomatedBuilder}
        />
      </div>
      
      <GenerationProgressBar 
        isGenerating={isGenerating} 
        progress={generatingProgress} 
      />
      
      <EditorLayout
        flowRef={reactFlowWrapper}
        flowCanvas={
          <ReactFlowCanvas
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onNodeClick={onNodeClick}
          />
        }
        sidePanel={
          selectedNode && (
            <NodeEditPanel
              selectedNode={selectedNode}
              onUpdate={handleUpdateNode}
              onClose={() => setSelectedNode(null)}
            />
          )
        }
      />
    </>
  );
}
