
import { ValueChainData, AIGenerationPrompt } from "@/types/valueChain";
import { aiService } from "@/services/aiService";
import { aiPromptBuilder } from "./aiPromptBuilder";
import { responseParser } from "./responseParser";
import { toast } from "sonner";

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

      // Call the AI service to generate the value chain
      const result = await aiService.analyzeContent({
        type: 'esg-assessment',
        content: promptText,
      });
      
      // Parse the result
      return responseParser.parseAIResponse(result);
    } catch (error) {
      console.error("Error generating value chain with AI:", error);
      toast.error("Failed to generate value chain");
      return null;
    }
  }
};
