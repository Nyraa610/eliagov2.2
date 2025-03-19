
import { useCallback } from "react";
import { Node, Edge, useReactFlow } from "@xyflow/react";
import { ValueChainData, AIGenerationPrompt } from "@/types/valueChain";
import { valueChainService } from "@/services/value-chain";
import { toast } from "sonner";

interface ValueChainActionsProps {
  nodes: Node[];
  edges: Edge[];
  setNodes: (nodes: Node[] | ((nds: Node[]) => Node[])) => void;
  setEdges: (edges: Edge[] | ((eds: Edge[]) => Edge[])) => void;
  setSelectedNode: (node: any) => void;
  company?: any;
}

export function useValueChainActions({
  nodes,
  edges,
  setNodes,
  setEdges,
  setSelectedNode,
  company
}: ValueChainActionsProps) {
  const reactFlowInstance = useReactFlow();

  // Save the value chain
  const handleSave = useCallback(async () => {
    if (!company) {
      toast.error("No company profile available");
      return;
    }
    
    const valueChainData: ValueChainData = {
      nodes,
      edges,
      name: `${company.name} Value Chain`,
      companyId: company.id
    };
    
    const success = await valueChainService.saveValueChain(valueChainData);
    if (success) {
      toast.success("Value chain saved successfully");
    }
  }, [nodes, edges, company]);

  // Export the value chain as JSON
  const handleExport = useCallback(() => {
    const valueChainData: ValueChainData = {
      nodes,
      edges,
      name: company ? `${company.name} Value Chain` : "Value Chain"
    };
    
    valueChainService.exportAsJson(valueChainData);
  }, [nodes, edges, company]);

  // Import a value chain from a JSON file
  const handleImport = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const jsonData = JSON.parse(event.target?.result as string);
        if (jsonData.nodes && jsonData.edges) {
          setNodes(jsonData.nodes);
          setEdges(jsonData.edges);
          toast.success("Value chain imported successfully");
        } else {
          toast.error("Invalid value chain data format");
        }
      } catch (error) {
        toast.error("Failed to parse JSON file");
        console.error(error);
      }
    };
    reader.readAsText(file);
    
    // Reset the file input
    e.target.value = "";
  }, [setNodes, setEdges]);

  // Clear the canvas
  const handleClear = useCallback(() => {
    if (confirm("Are you sure you want to clear the canvas? This action cannot be undone.")) {
      setNodes([]);
      setEdges([]);
      setSelectedNode(null);
      toast.success("Canvas cleared");
    }
  }, [setNodes, setEdges, setSelectedNode]);

  // Zoom controls
  const handleZoomIn = useCallback(() => {
    reactFlowInstance.zoomIn();
  }, [reactFlowInstance]);
  
  const handleZoomOut = useCallback(() => {
    reactFlowInstance.zoomOut();
  }, [reactFlowInstance]);
  
  const handleReset = useCallback(() => {
    reactFlowInstance.fitView();
  }, [reactFlowInstance]);

  // AI generation
  const handleGenerateAI = useCallback(async (prompt: AIGenerationPrompt, setIsGenerating: (isGenerating: boolean) => void, setIsAIDialogOpen: (isOpen: boolean) => void) => {
    setIsGenerating(true);
    try {
      const valueChainData = await valueChainService.generateValueChain(prompt);
      if (valueChainData && valueChainData.nodes && valueChainData.edges) {
        setNodes(valueChainData.nodes);
        setEdges(valueChainData.edges);
        setIsAIDialogOpen(false);
        toast.success("Value chain generated successfully");
        
        // Reset the view to fit all nodes
        setTimeout(() => {
          reactFlowInstance.fitView();
        }, 100);
      } else {
        toast.error("Failed to generate value chain");
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred while generating the value chain");
    } finally {
      setIsGenerating(false);
    }
  }, [setNodes, setEdges, reactFlowInstance]);

  return {
    handleSave,
    handleExport,
    handleImport,
    handleClear,
    handleZoomIn,
    handleZoomOut,
    handleReset,
    handleGenerateAI
  };
}
