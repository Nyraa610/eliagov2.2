
import { useCallback } from "react";
import { Node, Edge, useReactFlow } from "@xyflow/react";
import { toast } from "sonner";
import { valueChainService } from "@/services/value-chain";
import { AIGenerationPrompt, ValueChainData, ValueChainNode, NodeData } from "@/types/valueChain";
import { Company } from "@/services/company/types";

interface UseValueChainActionsProps {
  nodes: Node<NodeData>[];
  edges: Edge[];
  setNodes: (nodes: Node<NodeData>[] | ((nds: Node<NodeData>[]) => Node<NodeData>[])) => void;
  setEdges: (edges: Edge[] | ((eds: Edge[]) => Edge[])) => void;
  setSelectedNode: (node: Node<NodeData> | null) => void;
  company: Company | null;
  onSaveSuccess?: (data: ValueChainData) => void;
}

export function useValueChainActions({
  nodes,
  edges,
  setNodes,
  setEdges,
  setSelectedNode,
  company,
  onSaveSuccess
}: UseValueChainActionsProps) {
  const reactFlowInstance = useReactFlow();

  const handleSave = useCallback(async () => {
    if (!company) {
      toast.error("No company selected");
      return;
    }

    try {
      const data: ValueChainData = {
        nodes: nodes as unknown as ValueChainNode[],
        edges,
        name: `${company.name} Value Chain`,
        companyId: company.id
      };
      
      const success = await valueChainService.saveValueChain(data);
      if (success) {
        if (onSaveSuccess) {
          onSaveSuccess(data);
        } else {
          toast.success("Value chain saved successfully");
        }
      } else {
        toast.error("Failed to save value chain");
      }
      
      return success ? data : null;
    } catch (error) {
      console.error("Error saving value chain:", error);
      toast.error("Failed to save value chain");
      return null;
    }
  }, [nodes, edges, company, onSaveSuccess]);

  const handleExport = useCallback(() => {
    const data: ValueChainData = {
      nodes: nodes as unknown as ValueChainNode[],
      edges,
      name: company?.name ? `${company.name} Value Chain` : "Value Chain"
    };

    valueChainService.exportAsJson(data);
  }, [nodes, edges, company]);

  const handleImport = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    // Handle file import
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const jsonData = JSON.parse(event.target?.result as string) as ValueChainData;
          if (jsonData.nodes && jsonData.edges) {
            setNodes(jsonData.nodes as unknown as Node<NodeData>[]);
            setEdges(jsonData.edges);
            setSelectedNode(null);
            toast.success("Value chain imported successfully");
          } else {
            toast.error("Invalid value chain data format");
          }
        } catch (error) {
          console.error("Error parsing imported JSON:", error);
          toast.error("Failed to parse imported file");
        }
      };
      reader.readAsText(file);
    } catch (error) {
      console.error("Error importing value chain:", error);
      toast.error("Failed to import value chain");
    }
  }, [setNodes, setEdges, setSelectedNode]);

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
        setNodes(data.nodes as unknown as Node<NodeData>[]);
        setEdges(data.edges);
        setSelectedNode(null);
        toast.success("Value chain generated successfully");
        setIsAIDialogOpen(false);
      } else {
        toast.error("AI failed to generate a valid value chain");
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
