
import { AIGenerationPrompt } from "@/types/valueChain";
import { toast } from "sonner";
import { valueChainService } from "@/services/value-chain";

interface UseAutomatedValueChainProps {
  setIsGenerating: (value: boolean) => void;
  setGeneratingProgress: (value: number) => void;
  setNodes: (nodes: any) => void;
  setEdges: (edges: any) => void;
  setSelectedNode: (node: any) => void;
  setIsAIDialogOpen: (value: boolean) => void;
  company: any;
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
  const onGenerateWithAI = async (prompt: AIGenerationPrompt) => {
    setIsGenerating(true);
    setIsAIDialogOpen(false);
    
    // Simulate progress updates
    const interval = setInterval(() => {
      setGeneratingProgress(prev => {
        const newProgress = prev + 5;
        return newProgress < 90 ? newProgress : 90;
      });
    }, 800);

    try {
      const data = await valueChainService.generateValueChain(prompt);
      if (data) {
        setNodes(data.nodes);
        setEdges(data.edges);
        setSelectedNode(null);
        setGeneratingProgress(100);
        toast.success("Value chain generated successfully");
      } else {
        toast.error("AI failed to generate a valid value chain");
      }
    } catch (error) {
      console.error("Error generating value chain:", error);
      toast.error("Failed to generate value chain");
    } finally {
      clearInterval(interval);
      
      // Reset progress after a short delay
      setTimeout(() => {
        setGeneratingProgress(0);
        setIsGenerating(false);
      }, 1000);
    }
  };

  const handleAutomatedValueChain = async (prompt: string, files: File[]) => {
    setIsGenerating(true);
    
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
      const documentUrls: string[] = files.map(file => file.name);
      
      console.log("Calling quickGenerateValueChain with prompt:", fullPrompt);
      const result = await valueChainService.quickGenerateValueChain(fullPrompt, documentUrls);
      
      if (result) {
        console.log("Generation successful, received data:", result);
        setNodes(result.nodes);
        setEdges(result.edges);
        setSelectedNode(null);
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
      clearInterval(interval);
      
      // Reset progress after a short delay
      setTimeout(() => {
        setGeneratingProgress(0);
        setIsGenerating(false);
      }, 1000);
    }
  };

  return {
    onGenerateWithAI,
    handleAutomatedValueChain
  };
}
