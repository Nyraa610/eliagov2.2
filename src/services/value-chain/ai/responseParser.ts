
import { ValueChainData, NodeData } from "@/types/valueChain";
import { AIProcessingResponse } from "./types";
import { toast } from "sonner";
import { Node } from "@xyflow/react";

/**
 * Parser for AI-generated responses
 */
export const responseParser = {
  /**
   * Parses and formats AI response into ValueChainData
   */
  parseAIResponse: (result: { result: string }): ValueChainData | null => {
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
      
      return processValueChainData(valueChainData);
    } catch (parseError) {
      console.error("Error parsing AI response:", parseError);
      toast.error("Failed to parse the AI-generated value chain");
      return null;
    }
  },

  /**
   * Processes edge function response into ValueChainData
   */
  processEdgeFunctionResponse: (data: AIProcessingResponse): ValueChainData | null => {
    if (!data || !data.nodes || !Array.isArray(data.nodes)) {
      console.error("Invalid response from edge function:", data);
      return null;
    }
    
    return processValueChainData(data);
  }
};

/**
 * Helper function to process and format value chain data
 */
function processValueChainData(data: any): ValueChainData {
  // Validate and format the data
  const nodes = Array.isArray(data.nodes) ? data.nodes : [];
  const edges = Array.isArray(data.edges) ? data.edges : [];
  
  // Save PlantUML diagram if available
  let plantUml = null;
  if (data.metadata && data.metadata.plantUml) {
    plantUml = data.metadata.plantUml;
    console.log("PlantUML diagram included in response");
  }
  
  // Ensure all nodes have proper positioning and required data for ReactFlow
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
    
    // Ensure node has a data object with at least a label
    if (!node.data) {
      node.data = { label: node.label || `Node ${index}`, type: node.type || 'primary' };
    } else if (!node.data.label) {
      node.data.label = node.label || `Node ${index}`;
    }
    
    // Ensure node data has type property
    if (!node.data.type) {
      node.data.type = node.type || 'primary';
    }
    
    // Ensure node has a type (required for ReactFlow rendering)
    if (!node.type) {
      node.type = node.data.type || 'primary';
    }
    
    return node as Node<NodeData>;
  });
  
  // Ensure all edges have necessary properties
  const processedEdges = edges.map((edge, index) => {
    if (!edge.id) {
      edge.id = `edge-${Date.now()}-${index}`;
    }
    
    return edge;
  });
  
  return {
    nodes: processedNodes,
    edges: processedEdges,
    name: data.name || "AI Generated Value Chain",
    metadata: {
      plantUml: plantUml,
      generatedFor: data.metadata?.generatedFor || 'ESG reporting purposes',
      generationTimestamp: data.metadata?.generationTimestamp || new Date().toISOString(),
      ...data.metadata
    }
  };
}
