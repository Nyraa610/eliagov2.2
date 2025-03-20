
import { useState } from "react";
import { valueChainService } from "@/services/value-chain";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { ValueChainData } from "@/types/valueChain";

export function useAIGeneration() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generatedData, setGeneratedData] = useState<ValueChainData | null>(null);
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
      
      console.log("Calling quick generate value chain with prompt:", prompt);
      console.log("Document URLs:", documentUrls);
      
      // Call the value chain generator with the prompt
      const result = await valueChainService.quickGenerateValueChain(prompt, documentUrls);
      
      clearInterval(updateInterval);
      setGenerationProgress(100);
      
      if (result) {
        console.log("Value chain generated successfully:", result);
        setGeneratedData(result);
        toast.success("Value chain generated successfully!");
        
        // Save to localStorage before navigation
        try {
          localStorage.setItem('lastGeneratedValueChain', JSON.stringify(result));
          console.log("Saved value chain data to localStorage");
        } catch (storageError) {
          console.error("Error saving to localStorage:", storageError);
        }
        
        // Force a delay before navigation to ensure state updates have completed
        setTimeout(() => {
          console.log("Navigating to results page...");
          navigate("/assessment/value-chain/results", { 
            state: { valueChainData: result }
          });
        }, 1500);
        
        return true;
      } else {
        console.error("Failed to generate value chain - no result returned");
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
    generatedData,
    handleQuickGenerate
  };
}
