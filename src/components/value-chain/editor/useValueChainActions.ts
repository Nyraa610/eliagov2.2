
import { useCallback } from "react";
import { Node, Edge, useReactFlow } from "@xyflow/react";
import { toast } from "sonner";
import { valueChainService } from "@/services/value-chain";
import { AIGenerationPrompt, ValueChainData, ValueChainNode } from "@/types/valueChain";
import { Company } from "@/services/company/types";

interface UseValueChainActionsProps {
  nodes: Node[];
  edges: Edge[];
  setNodes: (nodes: Node[] | ((nds: Node[]) => Node[])) => void;
  setEdges: (edges: Edge[] | ((eds: Edge[]) => Edge[])) => void;
  setSelectedNode: (node: ValueChainNode | null) => void;
  company: Company | null;
}

export function useValueChainActions({
  nodes,
  edges,
  setNodes,
  setEdges,
  setSelectedNode,
  company
}: UseValueChainActionsProps) {
  const reactFlowInstance = useReactFlow();

  const handleSave = useCallback(async () => {
    if (!company) {
      toast.error("No company selected");
      return;
    }

    try {
      const data: ValueChainData = {
        nodes: nodes as ValueChainNode[],
        edges,
        name: `${company.name} Value Chain`,
        companyId: company.id
      };
      
      await valueChainService.saveValueChain(data);
      toast.success("Value chain saved successfully");
    } catch (error) {
      console.error("Error saving value chain:", error);
      toast.error("Failed to save value chain");
    }
  }, [nodes, edges, company]);

  const handleExport = useCallback(() => {
    const data: ValueChainData = {
      nodes: nodes as ValueChainNode[],
      edges,
      name: company?.name ? `${company.name} Value Chain` : "Value Chain"
    };

    valueChainService.exportAsJson(data);
  }, [nodes, edges, company]);

  const handleImport = useCallback(async () => {
    // Since there's no importValueChain method, we'll implement file input handling here
    // This would typically involve a file input dialog that parses a JSON file
    toast.error("Import functionality not yet implemented");
    // For future implementation, we would read a file, parse it as JSON,
    // validate it as ValueChainData, and then update the nodes and edges
  }, []);

  const handleClear = useCallback(() => {
    setNodes([]);
    setEdges([]);
    setSelectedNode(null);
    toast.success("Value chain cleared");
  }, [setNodes, setEdges, setSelectedNode]);

  const handleZoomIn = useCallback(() => {
    reactFlowInstance.zoomIn();
  }, [reactFlowInstance]);

  const handleZoomOut = useCallback(() => {
    reactFlowInstance.zoomOut();
  }, [reactFlowInstance]);

  const handleReset = useCallback(() => {
    reactFlowInstance.fitView();
  }, [reactFlowInstance]);

  const handleGenerateAI = useCallback(async (
    prompt: AIGenerationPrompt,
    setIsGenerating: (value: boolean) => void,
    setIsAIDialogOpen: (value: boolean) => void
  ) => {
    setIsGenerating(true);
    try {
      const data = await valueChainService.generateValueChain(prompt);
      if (data) {
        setNodes(data.nodes);
        setEdges(data.edges);
        setSelectedNode(null);
        toast.success("Value chain generated successfully");
        setIsAIDialogOpen(false);
      }
    } catch (error) {
      console.error("Error generating value chain:", error);
      toast.error("Failed to generate value chain");
    } finally {
      setIsGenerating(false);
    }
  }, [setNodes, setEdges, setSelectedNode]);

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
