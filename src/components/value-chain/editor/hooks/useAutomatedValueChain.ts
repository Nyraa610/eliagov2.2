
import { useState, useCallback } from "react";
import { toast } from "sonner";
import { valueChainService } from "@/services/value-chain";
import { Company } from "@/services/company/types";
import { AIGenerationPrompt } from "@/types/valueChain";

interface UseAutomatedValueChainProps {
  setIsGenerating: (isGenerating: boolean) => void;
  setGeneratingProgress: (progress: number) => void;
  setNodes: (nodes: any) => void;
  setEdges: (edges: any) => void;
  setSelectedNode: (node: any) => void;
  setIsAIDialogOpen: (isOpen: boolean) => void;
  company: Company | null;
}

export function useAutomatedValueChain({
  setIsGenerating,
  setGeneratingProgress,
  setNodes,
  setEdges,
  setSelectedNode,
  setIsAIDialogOpen,
  company
}: UseAutomatedValueChainProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  const onGenerateWithAI = useCallback(async (prompt: AIGenerationPrompt) => {
    if (isProcessing) return;
    
    setIsProcessing(true);
    setIsGenerating(true);
    setGeneratingProgress(0);
    
    try {
      // Update progress regularly
      const progressInterval = setInterval(() => {
        // Get current progress
        let currentProgress = 0;
        setGeneratingProgress((prev) => {
          // Make sure we never go past 90% until the actual data arrives
          currentProgress = prev + 5;
          return currentProgress > 90 ? 90 : currentProgress;
        });
      }, 500);
      
      console.log("Generating value chain with AI prompt:", prompt);
      
      const result = await valueChainService.generateValueChain(prompt);
      
      clearInterval(progressInterval);
      setGeneratingProgress(100);
      
      // Update state with generated value chain
      if (result && result.nodes && result.edges) {
        console.log("AI generated value chain:", result);
        
        // Short delay to show 100% before setting the new nodes/edges
        setTimeout(() => {
          setNodes(result.nodes);
          setEdges(result.edges);
          setSelectedNode(null);
          setIsGenerating(false);
          setIsAIDialogOpen(false);
          toast.success("Value chain generated successfully");
        }, 500);
      } else {
        throw new Error("Invalid result format from AI generation");
      }
    } catch (error) {
      console.error("Error generating value chain with AI:", error);
      toast.error("Failed to generate value chain. Please try again.");
      setGeneratingProgress(0);
      setIsGenerating(false);
    } finally {
      setIsProcessing(false);
    }
  }, [isProcessing, setIsGenerating, setGeneratingProgress, setNodes, setEdges, setSelectedNode, setIsAIDialogOpen]);

  const handleAutomatedValueChain = useCallback(async (prompt: string, files: File[] = []) => {
    if (!company) {
      toast.error("Please select a company first");
      return;
    }
    
    if (isProcessing) return;
    
    setIsProcessing(true);
    setIsGenerating(true);
    setGeneratingProgress(0);
    
    try {
      // Update progress regularly
      const progressInterval = setInterval(() => {
        // Get current progress
        let currentProgress = 0;
        setGeneratingProgress((prev) => {
          // Make sure we never go past 90% until the actual data arrives
          currentProgress = prev + 5;
          return currentProgress > 90 ? 90 : currentProgress;
        });
      }, 500);
      
      console.log("Starting automated value chain generation for company:", company.name);
      
      // Call the quick generate value chain service with files if available
      const result = await valueChainService.quickGenerateValueChain(prompt, {
        companyName: company.name,
        industry: company.industry || 'Unknown',
        companyId: company.id,
        files
      });
      
      clearInterval(progressInterval);
      setGeneratingProgress(100);
      
      // Update state with generated value chain
      if (result && result.nodes && result.edges) {
        console.log("Automated value chain generated:", result);
        
        // Short delay to show 100% before setting the new nodes/edges
        setTimeout(() => {
          setNodes(result.nodes);
          setEdges(result.edges);
          setSelectedNode(null);
          setIsGenerating(false);
          toast.success("Value chain generated automatically");
        }, 500);
      } else {
        throw new Error("Invalid result format from automated generation");
      }
    } catch (error) {
      console.error("Error generating automated value chain:", error);
      toast.error("Failed to generate automated value chain. Please try again.");
      setGeneratingProgress(0);
      setIsGenerating(false);
    } finally {
      setIsProcessing(false);
    }
  }, [company, isProcessing, setIsGenerating, setGeneratingProgress, setNodes, setEdges, setSelectedNode]);

  return {
    onGenerateWithAI,
    handleAutomatedValueChain
  };
}
