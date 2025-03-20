
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.23.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    
    if (!OPENAI_API_KEY) {
      throw new Error('Missing OpenAI API key');
    }

    // Parse request data
    const { prompt, documentUrls } = await req.json();

    // Create the prompt for OpenAI
    const systemPrompt = `
      You are an expert in ESG (Environmental, Social, and Governance) reporting and value chain analysis.
      Your task is to create a detailed value chain model for the company described below.
      
      The response should be ONLY valid JSON with this structure:
      {
        "nodes": [
          {
            "id": "unique-id",
            "type": "primary" | "support" | "external",
            "position": { "x": number, "y": number },
            "data": {
              "label": "Activity Name",
              "description": "Detailed description",
              "esgImpact": "Description of ESG impacts"
            }
          }
        ],
        "edges": [
          {
            "id": "edge-id",
            "source": "source-node-id",
            "target": "target-node-id",
            "label": "Optional connection description"
          }
        ],
        "metadata": {
          "plantUml": "Optional PlantUML diagram code"
        }
      }
      
      For the nodes:
      - Primary activities should be positioned in a horizontal line (y positions around 200-250)
      - Support activities should be positioned above primary activities (y positions around 50-150)
      - External factors should be positioned around the edges
      - Node positions should form a logical flow
      - Include detailed ESG impacts for each node
      
      For the edges:
      - Connect related activities logically
      - Add meaningful labels where relevant, particularly noting ESG connections
      
      Include a PlantUML representation in the metadata section if possible.
      
      Only respond with valid JSON. Do not include any other text or explanation.
    `;
    
    // Add document context if available
    let userPrompt = JSON.stringify(prompt);
    if (documentUrls && documentUrls.length > 0) {
      userPrompt += `\n\nAdditional context from uploaded documents: The user has provided ${documentUrls.length} document(s) which should be considered in the analysis. Document URLs: ${JSON.stringify(documentUrls)}`;
    }
    
    // Call OpenAI to generate the value chain
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 4000,
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
    }
    
    const data = await response.json();
    let valueChainData;
    
    try {
      // Extract the JSON content from the response
      const content = data.choices[0].message.content;
      
      // Parse the JSON response
      valueChainData = JSON.parse(content);
      
      // Validate the response structure
      if (!valueChainData.nodes || !Array.isArray(valueChainData.nodes)) {
        throw new Error('Invalid value chain data: missing nodes array');
      }
      
      if (!valueChainData.edges || !Array.isArray(valueChainData.edges)) {
        throw new Error('Invalid value chain data: missing edges array');
      }
      
      // Process nodes to ensure they have proper positioning
      valueChainData.nodes = valueChainData.nodes.map((node, index) => {
        if (!node.position) {
          // Assign default positions based on node type
          const type = node.type || 'primary';
          let x = 150 + (index % 4) * 250;
          let y = 200;
          
          if (type === 'support') y = 100;
          if (type === 'external') y = 350;
          
          node.position = { x, y };
        }
        
        return node;
      });
      
      // Add metadata about document usage
      if (documentUrls && documentUrls.length > 0) {
        valueChainData.metadata = valueChainData.metadata || {};
        valueChainData.metadata.documentsUsed = documentUrls.length;
      }
    } catch (error) {
      console.error('Error parsing OpenAI response:', error);
      console.log('Raw OpenAI response:', data.choices[0].message.content);
      throw new Error(`Failed to parse OpenAI response: ${error.message}`);
    }
    
    return new Response(JSON.stringify(valueChainData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in value-chain-generator:', error);
    
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
