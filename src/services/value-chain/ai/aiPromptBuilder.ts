
import { AIGenerationPrompt } from "@/types/valueChain";

/**
 * Builds structured prompts for AI value chain generation
 */
export const aiPromptBuilder = {
  /**
   * Creates a detailed prompt for value chain generation based on company data
   */
  buildValueChainPrompt: (prompt: AIGenerationPrompt): string => {
    return `
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
  }
};
