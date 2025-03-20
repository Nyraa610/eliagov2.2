
import { ValueChainData, AIGenerationPrompt } from "@/types/valueChain";
import { aiPromptBuilder } from "./aiPromptBuilder";
import { responseParser } from "./responseParser";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

/**
 * Service for detailed AI-based value chain generation
 */
export const detailedGenerationService = {
  /**
   * Generate value chain using AI based on company data and contextual documents
   */
  generateValueChain: async (prompt: AIGenerationPrompt): Promise<ValueChainData | null> => {
    try {
      // Prepare a structured prompt for the AI
      const promptText = aiPromptBuilder.buildValueChainPrompt(prompt);

      console.log("Sending AI request for value chain generation");

      // Call the Supabase Edge Function directly to ensure OpenAI integration works
      const { data, error } = await supabase.functions.invoke('value-chain-generator', {
        body: {
          prompt: promptText,
          companyName: prompt.companyName,
          industry: prompt.industry
        }
      });
      
      if (error) {
        console.error("Edge function error:", error);
        throw new Error("Failed to generate value chain: " + error.message);
      }
      
      console.log("Value chain generated:", data);
      
      // Process the data to ensure it has the correct format for ReactFlow
      const processedData = responseParser.processEdgeFunctionResponse(data);
      if (!processedData) {
        throw new Error("Failed to process value chain data");
      }
      
      return processedData;
    } catch (error) {
      console.error("Error generating value chain with AI:", error);
      toast.error("Failed to generate value chain");
      return null;
    }
  }
};
