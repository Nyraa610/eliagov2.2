
import { useState } from "react";
import { valueChainService } from "@/services/value-chain";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export function useAIGeneration() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const navigate = useNavigate();

  const handleQuickGenerate = async (prompt: string, documentUrls: string[]) => {
    setIsGenerating(true);
    setGenerationProgress(0);
    
    try {
      // Start progress simulation
      const updateInterval = setInterval(() => {
        setGenerationProgress(prev => {
          const newProgress = prev + 5;
          return newProgress < 90 ? newProgress : prev;
        });
      }, 500);
      
      // Call the value chain generator with the prompt
      const result = await valueChainService.quickGenerateValueChain(prompt, documentUrls);
      
      clearInterval(updateInterval);
      setGenerationProgress(100);
      
      if (result) {
        toast.success("Value chain generated successfully!");
        
        // Navigate to the results page with the generated data
        setTimeout(() => {
          navigate("/assessment/value-chain/results", { 
            state: { valueChainData: result }
          });
        }, 1000);
        
        return true;
      } else {
        toast.error("Failed to generate value chain");
        return false;
      }
    } catch (error) {
      console.error("AI generation error:", error);
      toast.error("Error generating value chain. Please try again.");
      return false;
    } finally {
      setTimeout(() => {
        setGenerationProgress(0);
        setIsGenerating(false);
      }, 1000);
    }
  };

  return {
    isGenerating,
    generationProgress,
    handleQuickGenerate
  };
}
