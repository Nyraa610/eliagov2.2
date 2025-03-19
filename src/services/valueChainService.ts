
import { supabase } from "@/lib/supabase";
import { aiService } from "@/services/aiService";
import { ValueChainData, ValueChainNode, ValueChainEdge, AIGenerationPrompt } from "@/types/valueChain";
import { toast } from "sonner";

export const valueChainService = {
  /**
   * Save value chain data
   */
  saveValueChain: async (data: ValueChainData): Promise<boolean> => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        console.log("No authenticated user session found");
        toast.error("You need to be logged in to save value chain data");
        return false;
      }
      
      const userId = session.user.id;
      
      // Check if there's an existing record for this company
      const { data: existingRecord } = await supabase
        .from('value_chains')
        .select('id')
        .eq('company_id', data.companyId)
        .maybeSingle();
      
      const payload = {
        user_id: userId,
        company_id: data.companyId,
        name: data.name || 'Value Chain Model',
        data: {
          nodes: data.nodes,
          edges: data.edges
        },
        updated_at: new Date().toISOString()
      };
      
      let result;
      
      if (existingRecord?.id) {
        // Update existing record
        result = await supabase
          .from('value_chains')
          .update(payload)
          .eq('id', existingRecord.id);
      } else {
        // Insert new record
        result = await supabase
          .from('value_chains')
          .insert([payload]);
      }
      
      if (result.error) {
        console.error("Error saving value chain:", result.error.message);
        toast.error("Failed to save value chain");
        return false;
      }
      
      console.log(`Value chain saved for company ${data.companyId}`);
      toast.success("Value chain saved successfully");
      return true;
    } catch (error) {
      console.error("Exception saving value chain:", error);
      toast.error("An error occurred while saving value chain");
      return false;
    }
  },

  /**
   * Load value chain data for a company
   */
  loadValueChain: async (companyId: string): Promise<ValueChainData | null> => {
    try {
      const { data, error } = await supabase
        .from('value_chains')
        .select('*')
        .eq('company_id', companyId)
        .maybeSingle();
      
      if (error) {
        console.error("Error loading value chain:", error.message);
        return null;
      }
      
      if (!data) {
        return null;
      }
      
      return {
        nodes: data.data.nodes,
        edges: data.data.edges,
        name: data.name,
        companyId: data.company_id,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };
    } catch (error) {
      console.error("Exception loading value chain:", error);
      return null;
    }
  },

  /**
   * Generate value chain using AI based on company data
   */
  generateValueChain: async (prompt: AIGenerationPrompt): Promise<ValueChainData | null> => {
    try {
      // Prepare a structured prompt for the AI
      const promptText = `
        Generate a JSON value chain model for a company with these details:
        
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
           - data: {label: string, description: string}
        
        2. An array of "edges" connecting the nodes, each with:
           - id: a unique string identifier
           - source: the id of the source node
           - target: the id of the target node
           - label: optional description of the connection
        
        Organize the nodes to show a logical flow of activities.
        Primary activities should include: inbound logistics, operations, outbound logistics, marketing/sales, and service.
        Support activities should include: infrastructure, HR management, technology development, and procurement.
        External factors should include key suppliers and customers.
        
        Return only valid JSON with this structure, nothing else.
      `;

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
        
        const valueChainData = JSON.parse(jsonStr);
        
        // Validate and format the data
        const nodes = Array.isArray(valueChainData.nodes) ? valueChainData.nodes : [];
        const edges = Array.isArray(valueChainData.edges) ? valueChainData.edges : [];
        
        return {
          nodes,
          edges,
          name: `${prompt.companyName} Value Chain`
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
   * Export value chain as an image
   * @param canvasElement The canvas element to export
   * @returns A URL to the exported image
   */
  exportAsImage: async (canvasElement: HTMLElement): Promise<string | null> => {
    try {
      // Use html-to-image or similar library functionality
      // This is a placeholder for actual implementation
      console.log("Exporting canvas as image");
      
      // Return a data URL
      return null;
    } catch (error) {
      console.error("Error exporting value chain as image:", error);
      toast.error("Failed to export as image");
      return null;
    }
  },

  /**
   * Export value chain as JSON file
   */
  exportAsJson: (data: ValueChainData): void => {
    try {
      const jsonString = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      // Create a link and trigger download
      const a = document.createElement('a');
      a.href = url;
      a.download = `${data.name || 'value-chain'}.json`;
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success("Value chain exported as JSON");
    } catch (error) {
      console.error("Error exporting value chain as JSON:", error);
      toast.error("Failed to export as JSON");
    }
  }
};
