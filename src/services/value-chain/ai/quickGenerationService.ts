
import { ValueChainData } from "@/types/valueChain";
import { QuickGenerateParams } from "./types";
import { responseParser } from "./responseParser";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

/**
 * Service for quick AI-based value chain generation
 */
export const quickGenerationService = {
  /**
   * Quick generate a value chain using OpenAI via a Supabase Edge Function
   * @param prompt Text prompt describing the company and requirements
   * @param params Object containing company info and optional documents
   * @returns The generated value chain data or null if failed
   */
  quickGenerateValueChain: async (prompt: string, params: QuickGenerateParams): Promise<ValueChainData | null> => {
    try {
      console.log("Initiating quick value chain generation with AI");
      
      let documentUrls: string[] = params.documentUrls || [];
      
      // Process uploaded files if any
      if (params.files && params.files.length > 0) {
        // Here you would typically upload the files to storage and get their URLs
        // For now we'll just log them
        console.log(`Processing ${params.files.length} files for context`);
        const fileNames = params.files.map(file => file.name);
        documentUrls = [...documentUrls, ...fileNames];
      }
      
      // Call the Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('value-chain-generator', {
        body: { 
          prompt,
          documentUrls,
          companyName: params.companyName,
          industry: params.industry,
          companyId: params.companyId
        }
      });
      
      if (error) {
        console.error("Edge function error:", error);
        throw new Error(`Edge function error: ${error.message}`);
      }
      
      console.log(`Generated value chain with ${data.nodes?.length || 0} nodes and ${data.edges?.length || 0} edges`);
      
      // Process the response
      const valueChainData = responseParser.processEdgeFunctionResponse(data);
      
      if (!valueChainData) {
        throw new Error("Invalid response from AI generation");
      }
      
      // Add metadata
      valueChainData.metadata = {
        ...valueChainData.metadata,
        generatedFrom: "Quick generation",
        prompt,
        documentsUsed: documentUrls.length,
        generationTimestamp: new Date().toISOString()
      };
      
      return valueChainData;
    } catch (error) {
      console.error("Error in quick value chain generation:", error);
      toast.error("Failed to generate value chain with AI");
      return null;
    }
  }
};
