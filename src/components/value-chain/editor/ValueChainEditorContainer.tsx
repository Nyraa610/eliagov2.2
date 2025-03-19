
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
import { DocumentUploadDialog } from "../DocumentUploadDialog";
import { AutomatedValueChainBuilder } from "../AutomatedValueChainBuilder";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Sparkles, Wand2, Upload } from "lucide-react";
import { toast } from "sonner";

// Import react-flow styles
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
    // Show confirmation toast
    toast.success(`${files.length} document(s) uploaded successfully`);
  };

  const handleAutomatedValueChain = async (prompt: string) => {
    setIsGenerating(true);
    setIsAutomatedBuilderOpen(false);
    
    // Simulate progress updates
    const interval = setInterval(() => {
      setGeneratingProgress(prev => {
        const newProgress = prev + 10;
        if (newProgress >= 100) {
          clearInterval(interval);
        }
        return newProgress < 100 ? newProgress : 99;
      });
    }, 1500);

    try {
      // Add custom prompt for ESG reporting
      const esgPrompt: AIGenerationPrompt = {
        companyName: company?.name || 'Your Company',
        industry: company?.industry || 'General',
        products: [],
        services: [],
        additionalInfo: `Build a value chain for ESG reporting purposes. Company location: ${company?.country || 'Unknown'}. 
        Additional context: ${prompt}. Please structure the value chain to highlight environmental, social, and governance aspects.`
      };
      
      // Pass the uploaded documents as context (simplified for demo)
      if (uploadedDocuments.length > 0) {
        esgPrompt.additionalInfo += `\nAnalysis based on ${uploadedDocuments.length} uploaded document(s).`;
      }
      
      await handleGenerateAI(esgPrompt, setIsGenerating, setIsAIDialogOpen);
      
      // Complete progress
      setGeneratingProgress(100);
      setTimeout(() => {
        setGeneratingProgress(0);
      }, 1000);
      
    } catch (error) {
      console.error("Error generating automated value chain:", error);
      toast.error("Failed to generate value chain");
    } finally {
      clearInterval(interval);
      setIsGenerating(false);
    }
  };

  return (
    <div className="h-[calc(100vh-200px)] min-h-[800px]">
      {!nodes.length && !isGenerating && (
        <div className="bg-muted p-6 mb-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Value Chain Modeling in Elia Go</h3>
          <p className="mb-4 text-muted-foreground">
            This tool helps you visualize and analyze your company's value chain - the sequence of activities that create value for customers.
            Value chains are essential for ESG reporting as they help identify environmental and social impacts across your business operations.
          </p>
          <ul className="list-disc pl-5 space-y-2 mb-4 text-muted-foreground">
            <li>Use the toolbar to add different types of nodes: primary activities (core operations), support activities, and external factors</li>
            <li>Connect nodes by dragging from one node's handle to another</li>
            <li>Click on any node to edit its properties</li>
            <li>Use the AI generation feature to automatically create a value chain based on your company information</li>
            <li>Upload supporting documents to help with AI-assisted value chain creation</li>
          </ul>
          <div className="flex gap-2 mt-4">
            <Button onClick={() => setIsAIDialogOpen(true)} className="gap-1">
              <Sparkles className="h-4 w-4" />
              Generate with AI
            </Button>
            <Button onClick={() => setIsAutomatedBuilderOpen(true)} variant="outline" className="gap-1">
              <Wand2 className="h-4 w-4" />
              Automated Builder
            </Button>
            <Button onClick={() => setIsUploadDialogOpen(true)} variant="outline" className="gap-1">
              <Upload className="h-4 w-4" />
              Upload Documents
            </Button>
          </div>
        </div>
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
      
      {isGenerating && (
        <div className="mb-4 p-4 border rounded-lg bg-background">
          <h3 className="text-sm font-medium mb-2">Generating Value Chain</h3>
          <Progress value={generatingProgress} className="h-2 mb-2" />
          <p className="text-xs text-muted-foreground">
            {generatingProgress < 30 ? "Analyzing company information..." : 
             generatingProgress < 60 ? "Identifying key value chain components..." :
             generatingProgress < 90 ? "Creating value chain structure..." :
             "Finalizing your value chain..."}
          </p>
        </div>
      )}
      
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
      
      <DocumentUploadDialog
        open={isUploadDialogOpen}
        onOpenChange={setIsUploadDialogOpen}
        onUpload={handleDocumentUpload}
      />
      
      <AutomatedValueChainBuilder
        open={isAutomatedBuilderOpen}
        onOpenChange={setIsAutomatedBuilderOpen}
        onGenerate={handleAutomatedValueChain}
        companyName={company?.name || ''}
        industry={company?.industry || ''}
        location={company?.country || ''}
      />
    </div>
  );
}
