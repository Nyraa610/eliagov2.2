
import { ValueChainData } from "@/types/valueChain";
import { useCompanyProfile } from "@/hooks/useCompanyProfile";
import { useValueChainNodes } from "./useValueChainNodes";
import { useValueChainActions } from "./useValueChainActions";
import { DialogManager } from "./components/DialogManager";
import { EditorContent } from "./components/EditorContent";
import { useDialogState } from "./hooks/useDialogState";
import { useDocumentUpload } from "./hooks/useDocumentUpload";
import { useGenerationProgress } from "./hooks/useGenerationProgress";
import { useAutomatedValueChain } from "./hooks/useAutomatedValueChain";

// Import react-flow styles - IMPORTANT!
import "@xyflow/react/dist/style.css";
import "@/styles/value-chain.css";

interface ValueChainEditorContainerProps {
  initialData?: ValueChainData | null;
}

export function ValueChainEditorContainer({ initialData }: ValueChainEditorContainerProps) {
  const { company } = useCompanyProfile();
  
  // Use custom hooks for state management
  const dialogState = useDialogState();
  const documentUpload = useDocumentUpload();
  const generationProgress = useGenerationProgress();

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

  console.log("Rendering ValueChainEditorContainer with nodes:", nodes.length, "edges:", edges.length);

  const {
    handleSave,
    handleExport,
    handleImport,
    handleClear,
    handleZoomIn,
    handleZoomOut,
    handleReset
  } = useValueChainActions({
    nodes,
    edges,
    setNodes,
    setEdges,
    setSelectedNode,
    company
  });

  // Custom hook for automated value chain generation
  const { onGenerateWithAI, handleAutomatedValueChain } = useAutomatedValueChain({
    setIsGenerating: generationProgress.setIsGenerating,
    setGeneratingProgress: generationProgress.setGeneratingProgress,
    setNodes,
    setEdges,
    setSelectedNode,
    setIsAIDialogOpen: dialogState.setIsAIDialogOpen,
    company
  });

  return (
    <div className="h-[calc(100vh-200px)] min-h-[800px]">
      <EditorContent
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        selectedNode={selectedNode}
        handleUpdateNode={handleUpdateNode}
        handleAddNode={handleAddNode}
        handleSave={handleSave}
        handleExport={handleExport}
        handleImport={handleImport}
        handleClear={handleClear}
        handleZoomIn={handleZoomIn}
        handleZoomOut={handleZoomOut}
        handleReset={handleReset}
        isGenerating={generationProgress.isGenerating}
        generatingProgress={generationProgress.generatingProgress}
        onGenerateAI={() => dialogState.setIsAIDialogOpen(true)}
        onUploadDocuments={() => dialogState.setIsUploadDialogOpen(true)}
        onAutomatedBuilder={() => dialogState.setIsAutomatedBuilderOpen(true)}
        setSelectedNode={setSelectedNode}
      />
      
      <DialogManager
        isAIDialogOpen={dialogState.isAIDialogOpen}
        setIsAIDialogOpen={dialogState.setIsAIDialogOpen}
        isUploadDialogOpen={dialogState.isUploadDialogOpen}
        setIsUploadDialogOpen={dialogState.setIsUploadDialogOpen}
        isAutomatedBuilderOpen={dialogState.isAutomatedBuilderOpen}
        setIsAutomatedBuilderOpen={dialogState.setIsAutomatedBuilderOpen}
        isGenerating={generationProgress.isGenerating}
        companyName={company?.name || ''}
        industry={company?.industry || ''}
        location={company?.country || ''}
        onGenerateWithAI={onGenerateWithAI}
        onDocumentUpload={documentUpload.handleDocumentUpload}
        onAutomatedValueChain={handleAutomatedValueChain}
      />
    </div>
  );
}
