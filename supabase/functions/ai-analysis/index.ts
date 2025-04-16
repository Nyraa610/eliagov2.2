
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { verifyAuth, corsHeaders } from "./handlers/auth.ts";
import { initializeOpenAI, getSystemPrompt, createChatCompletion } from "./handlers/openai.ts";
import { saveESGAssessment } from "./handlers/database.ts";
import { AIAnalysisRequest } from "./handlers/types.ts";

serve(async (req) => {
  try {
    // Handle CORS for preflight requests
    if (req.method === "OPTIONS") {
      return new Response(null, {
        headers: corsHeaders,
      });
    }
    
    // Verify JWT token
    try {
      const user = await verifyAuth(req.headers.get('Authorization'));
      
      // Parse request body
      const requestData: AIAnalysisRequest = await req.json();
      const { type, content, context, analysisType } = requestData;
      
      if (!type || !content) {
        return new Response(JSON.stringify({ error: "Missing required fields: type or content" }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      
      // Initialize OpenAI
      const openai = initializeOpenAI();
      
      // Get system prompt based on analysis type
      const systemPrompt = getSystemPrompt(type, analysisType);
      
      // Define messages for OpenAI chat completion
      let messages = [
        { role: "system", content: systemPrompt }
      ];
      
      // For chat assistant, include context from previous messages if available
      if (type === 'esg-assistant' && context && Array.isArray(context)) {
        for (const msg of context) {
          if (msg.role === 'user' || msg.role === 'assistant') {
            messages.push({ 
              role: msg.role, 
              content: msg.content 
            });
          }
        }
      }
      
      // Add the current user message
      messages.push({ role: "user", content: content });
      
      // Call OpenAI API
      const completion = await createChatCompletion(openai, messages, type);
      
      // Extract the result properly, handling potential undefined values
      let result = "No result generated";
      if (completion && completion.data && completion.data.choices && 
          completion.data.choices.length > 0 && completion.data.choices[0].message) {
        result = completion.data.choices[0].message.content || "No result generated";
      }
      
      // Save ESG assessment data if it's an ESG assessment
      if (type === 'esg-assessment') {
        await saveESGAssessment(user.id, content, result);
      }
      
      // Return the analysis result
      return new Response(JSON.stringify({ result }), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      });
      
    } catch (authError) {
      console.error("Auth error:", authError);
      return new Response(JSON.stringify({ error: authError.message }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
  } catch (error) {
    console.error("Error processing request:", error);
    
    return new Response(JSON.stringify({ error: error.message || "An unexpected error occurred" }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  }
});
