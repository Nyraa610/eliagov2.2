
import { aiService } from "@/services/aiService";
import { ValueChainData, AIGenerationPrompt } from "@/types/valueChain";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

/**
 * Service for AI-related functionality of value chain
 */
export const valueChainAIService = {
  /**
   * Generate value chain using AI based on company data and contextual documents
   */
  generateValueChain: async (prompt: AIGenerationPrompt): Promise<ValueChainData | null> => {
    try {
      // Prepare a structured prompt for the AI
      const promptText = `
        Generate a detailed JSON value chain model for ESG reporting purposes with these details:
        
        Company name: ${prompt.companyName}
        Industry: ${prompt.industry}
        Products: ${prompt.products.join(', ')}
        Services: ${prompt.services.join(', ')}
        Additional information: ${prompt.additionalInfo || 'None'}
        
        The JSON should include:
        1. An array of "nodes" representing value chain activities, each with:
           - id: a unique string identifier
           - type: "primary" (for primary activities), "support" (for support activities), or "external" (for external factors)
           - position: {x: number, y: number} for visual positioning
           - data: {
               label: string, 
               description: string, 
               esgImpact: string (detailed description of environmental, social, and governance impacts)
             }
        
        2. An array of "edges" connecting the nodes, each with:
           - id: a unique string identifier
           - source: the id of the source node
           - target: the id of the target node
           - label: description of the connection, particularly noting ESG implications
        
        Organize the nodes to show a comprehensive ESG-focused value chain:
        - Primary activities should include: inbound logistics, operations, outbound logistics, marketing/sales, and service.
        - Support activities should include: infrastructure, HR management, technology development, and procurement.
        - External factors should include key suppliers, customers, regulatory factors, and environmental considerations.
        
        For each node, include an "esgImpact" field that describes the specific environmental, social, and governance impacts
        of that activity component. Be detailed and specific about:
        - Environmental impacts (resources used, pollution, waste, etc.)
        - Social impacts (labor practices, community impacts, etc.)
        - Governance implications (compliance requirements, transparency needs, etc.)
        
        Position the nodes in a logical flow with:
        - Support activities at the top (y positions between 50-150)
        - Primary activities in the middle (y positions between 200-350)
        - External factors around the edges
        
        Return only valid JSON with this structure, nothing else.
        
        If appropriate, you may provide a PlantUML representation in the metadata section of the JSON to visualize the relationship.
      `;

      console.log("Sending AI request for value chain generation");

      // Call the AI service to generate the value chain
      const result = await aiService.analyzeContent({
        type: 'esg-assessment',
        content: promptText,
      });
      
      // Parse the result
      try {
        // The AI might wrap the JSON in markdown code blocks, so we need to extract it
        const jsonRegex = /```json\s*([\s\S]*?)\s*```|```\s*([\s\S]*?)\s*```|(\{[\s\S]*\})/;
        const match = result.result.match(jsonRegex);
        
        let jsonStr = '';
        if (match) {
          jsonStr = match[1] || match[2] || match[3];
        } else {
          jsonStr = result.result;
        }
        
        // Clean up any markdown or text that might still be in the string
        jsonStr = jsonStr.trim();
        if (!jsonStr.startsWith('{')) {
          jsonStr = '{' + jsonStr.split('{').slice(1).join('{');
        }
        if (!jsonStr.endsWith('}')) {
          jsonStr = jsonStr.split('}').slice(0, -1).join('}') + '}';
        }
        
        console.log("Parsing AI response to JSON");
        const valueChainData = JSON.parse(jsonStr);
        
        // Validate and format the data
        const nodes = Array.isArray(valueChainData.nodes) ? valueChainData.nodes : [];
        const edges = Array.isArray(valueChainData.edges) ? valueChainData.edges : [];
        
        // Save PlantUML diagram if available
        let plantUml = null;
        if (valueChainData.metadata && valueChainData.metadata.plantUml) {
          plantUml = valueChainData.metadata.plantUml;
          console.log("PlantUML diagram included in response");
        }
        
        // Ensure all nodes have proper positioning
        const processedNodes = nodes.map((node, index) => {
          // If node is missing position, assign a default position based on type
          if (!node.position) {
            const type = node.type || node.data?.type || 'primary';
            let x = 150 + (index % 3) * 250;
            let y = 150;
            
            if (type === 'primary') {
              y = 250;
            } else if (type === 'support') {
              y = 100;
            } else if (type === 'external') {
              y = 400;
            }
            
            node.position = { x, y };
          }
          
          // Ensure node has an id
          if (!node.id) {
            node.id = `${node.type || 'node'}-${Date.now()}-${index}`;
          }
          
          return node;
        });
        
        return {
          nodes: processedNodes,
          edges,
          name: `${prompt.companyName} ESG Value Chain`,
          metadata: {
            plantUml,
            generatedFor: 'ESG reporting purposes',
            generationTimestamp: new Date().toISOString()
          }
        };
      } catch (parseError) {
        console.error("Error parsing AI response:", parseError);
        console.log("Raw AI response:", result.result);
        toast.error("Failed to parse the AI-generated value chain");
        return null;
      }
    } catch (error) {
      console.error("Error generating value chain with AI:", error);
      toast.error("Failed to generate value chain");
      return null;
    }
  },
  
  /**
   * Quick generate a value chain using OpenAI via a Supabase Edge Function
   * @param prompt Text prompt describing the company and requirements
   * @param documentUrls Optional array of document URLs to provide context
   * @returns The generated value chain data or null if failed
   */
  quickGenerateValueChain: async (prompt: string, documentUrls: string[] = []): Promise<ValueChainData | null> => {
    try {
      console.log("Initiating quick value chain generation with AI");
      
      // Call the Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('value-chain-generator', {
        body: { prompt, documentUrls }
      });
      
      if (error) {
        console.error("Edge function error:", error);
        throw new Error(`Edge function error: ${error.message}`);
      }
      
      if (!data || !data.nodes || !Array.isArray(data.nodes)) {
        console.error("Invalid response from edge function:", data);
        throw new Error("Invalid response from AI generation");
      }
      
      console.log(`Generated value chain with ${data.nodes.length} nodes and ${data.edges.length} edges`);
      
      return {
        nodes: data.nodes,
        edges: data.edges,
        name: "AI Generated Value Chain",
        metadata: {
          generatedFrom: "Quick generation",
          prompt,
          documentsUsed: documentUrls.length,
          generationTimestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      console.error("Error in quick value chain generation:", error);
      toast.error("Failed to generate value chain with AI");
      return null;
    }
  }
};
