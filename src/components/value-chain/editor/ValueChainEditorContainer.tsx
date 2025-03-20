
import { useRef, useState } from "react";
import { ValueChainData, AIGenerationPrompt } from "@/types/valueChain";
import { useCompanyProfile } from "@/hooks/useCompanyProfile";
import { NodeEditPanel } from "../NodeEditPanel";
import { ValueChainToolbar } from "../ValueChainToolbar";
import { ReactFlowCanvas } from "./ReactFlowCanvas";
import { useValueChainNodes } from "./useValueChainNodes";
import { useValueChainActions } from "./useValueChainActions";
import { toast } from "sonner";
import { EmptyStateGuide } from "./components/EmptyStateGuide";
import { GenerationProgressBar } from "./components/GenerationProgressBar";
import { EditorLayout } from "./components/EditorLayout";
import { DialogManager } from "./components/DialogManager";
import { valueChainService } from "@/services/value-chain";

// Import react-flow styles - IMPORTANT!
import "@xyflow/react/dist/style.css";
import "@/styles/value-chain.css";

interface ValueChainEditorContainerProps {
  initialData?: ValueChainData | null;
}

export function ValueChainEditorContainer({ initialData }: ValueChainEditorContainerProps) {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [isAIDialogOpen, setIsAIDialogOpen] = useState(false);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isAutomatedBuilderOpen, setIsAutomatedBuilderOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatingProgress, setGeneratingProgress] = useState(0);
  const { company } = useCompanyProfile();
  const [uploadedDocuments, setUploadedDocuments] = useState<File[]>([]);

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

  const handleDocumentUpload = (files: File[]) => {
    setUploadedDocuments(files);
    setIsUploadDialogOpen(false);
    toast.success(`${files.length} document(s) uploaded successfully`);
  };

  const handleAutomatedValueChain = async (prompt: string, files: File[]) => {
    setIsGenerating(true);
    setIsAutomatedBuilderOpen(false);
    
    // Simulate progress updates
    const interval = setInterval(() => {
      setGeneratingProgress(prev => {
        const newProgress = prev + 5;
        return newProgress < 90 ? newProgress : 90;
      });
    }, 800);

    try {
      console.log("Starting automated value chain generation with prompt:", prompt);
      console.log("Using company details:", company?.name, company?.industry, company?.country);
      
      // Add custom prompt for ESG reporting
      const fullPrompt = `
        Generate a value chain for ESG reporting purposes for ${company?.name || 'Company'}.
        Industry: ${company?.industry || 'General'}
        Location: ${company?.country || 'Global'}
        
        Additional context: ${prompt}
        
        Please structure the value chain to highlight environmental, social, and governance aspects.
      `;
      
      // Convert files to document URLs if needed
      // In a real implementation, these would be uploaded and converted to URLs
      const documentUrls: string[] = files.map(file => file.name);
      
      // Call the quick generate function from valueChainService
      console.log("Calling quickGenerateValueChain with prompt:", fullPrompt);
      const result = await valueChainService.quickGenerateValueChain(fullPrompt, documentUrls);
      
      if (result) {
        console.log("Generation successful, received data:", result);
        // Update the nodes and edges
        setNodes(result.nodes);
        setEdges(result.edges);
        setSelectedNode(null);
        
        // Set progress to 100%
        setGeneratingProgress(100);
        
        toast.success("Value chain generated successfully!");
      } else {
        console.error("Generation failed - no result returned");
        toast.error("Failed to generate value chain");
      }
    } catch (error) {
      console.error("Error generating automated value chain:", error);
      toast.error("Failed to generate value chain");
    } finally {
      // Clean up
      clearInterval(interval);
      
      // Reset progress after a short delay
      setTimeout(() => {
        setGeneratingProgress(0);
        setIsGenerating(false);
      }, 1000);
    }
  };

  return (
    <div className="h-[calc(100vh-200px)] min-h-[800px]">
      {!nodes.length && !isGenerating && (
        <EmptyStateGuide
          onOpenAIDialog={() => setIsAIDialogOpen(true)}
          onOpenAutomatedBuilder={() => setIsAutomatedBuilderOpen(true)}
          onOpenUploadDialog={() => setIsUploadDialogOpen(true)}
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
          onGenerateAI={() => setIsAIDialogOpen(true)}
          onUploadDocuments={() => setIsUploadDialogOpen(true)}
          onAutomatedBuilder={() => setIsAutomatedBuilderOpen(true)}
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
      
      <DialogManager
        isAIDialogOpen={isAIDialogOpen}
        setIsAIDialogOpen={setIsAIDialogOpen}
        isUploadDialogOpen={isUploadDialogOpen}
        setIsUploadDialogOpen={setIsUploadDialogOpen}
        isAutomatedBuilderOpen={isAutomatedBuilderOpen}
        setIsAutomatedBuilderOpen={setIsAutomatedBuilderOpen}
        isGenerating={isGenerating}
        companyName={company?.name || ''}
        industry={company?.industry || ''}
        location={company?.country || ''}
        onGenerateWithAI={onGenerateWithAI}
        onDocumentUpload={handleDocumentUpload}
        onAutomatedValueChain={handleAutomatedValueChain}
      />
    </div>
  );
}
