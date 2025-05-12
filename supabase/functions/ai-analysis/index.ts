
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { verifyAuth, corsHeaders } from "./handlers/auth.ts";
import { initializeOpenAI, getSystemPrompt, createChatCompletion } from "./handlers/openai.ts";
import { saveESGAssessment, saveChatHistory } from "./handlers/database.ts";
import { AIAnalysisRequest } from "./handlers/types.ts";

serve(async (req) => {
  const executionId = crypto.randomUUID();
  console.log(`[${executionId}] Starting AI Analysis request`);
  
  try {
    // Handle CORS for preflight requests
    if (req.method === "OPTIONS") {
      console.log(`[${executionId}] Handling CORS preflight request`);
      return new Response(null, {
        headers: corsHeaders,
      });
    }
    
    // Verify JWT token - wrap in try/catch to allow anonymous access for certain types
    let user = null;
    try {
      console.log(`[${executionId}] Verifying authentication`);
      user = await verifyAuth(req.headers.get('Authorization'));
      console.log(`[${executionId}] Authentication successful for user: ${user.id.substring(0, 8)}...`);
    } catch (authError) {
      console.log(`[${executionId}] Auth verification failed, continuing as anonymous: ${authError.message}`);
      // We'll continue as anonymous for certain request types
    }
    
    // Parse request body
    console.log(`[${executionId}] Parsing request body`);
    const requestData: AIAnalysisRequest = await req.json();
    const { type, content, context, analysisType } = requestData;
    
    console.log(`[${executionId}] Processing AI Analysis request:`, { 
      type, 
      analysisType, 
      contentLength: content?.length,
      contextLength: context?.length || 0
    });
    
    if (!type || !content) {
      console.error(`[${executionId}] Missing required fields: type or content`);
      return new Response(JSON.stringify({ error: "Missing required fields: type or content" }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    // Initialize OpenAI
    console.log(`[${executionId}] Initializing OpenAI client`);
    const openai = initializeOpenAI();
    
    // Get system prompt based on analysis type
    console.log(`[${executionId}] Getting system prompt for type: ${type}, analysisType: ${analysisType || 'none'}`);
    const systemPrompt = getSystemPrompt(type, analysisType);
    
    // Define messages for OpenAI chat completion
    let messages = [
      { role: "system", content: systemPrompt }
    ];
    
    // For chat assistant, include context from previous messages if available
    if (type === 'esg-assistant' && context && Array.isArray(context)) {
      console.log(`[${executionId}] Including ${context.length} context messages for chat assistant`);
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
    
    console.log(`[${executionId}] Calling OpenAI with ${messages.length} messages`);
    
    // Call OpenAI API
    const completion = await createChatCompletion(openai, messages, type);
    
    console.log(`[${executionId}] OpenAI response received:`, typeof completion, completion ? "has data" : "no data");
    
    // Extract the result properly, handling potential undefined values
    let result = "No result generated";
    
    try {
      if (completion && completion.data && completion.data.choices && 
          completion.data.choices.length > 0 && completion.data.choices[0].message) {
        result = completion.data.choices[0].message.content || "No result generated";
        console.log(`[${executionId}] Response content type: ${typeof result}`);
        console.log(`[${executionId}] Extracted result: ${result.substring(0, 100)}...`);
      } else {
        console.error(`[${executionId}] Invalid completion structure:`, JSON.stringify(completion, null, 2));
        
        // Attempt to recover from non-standard response formats
        if (completion && typeof completion === 'object') {
          // Try various paths to find the content
          if (completion.choices && completion.choices[0] && completion.choices[0].message) {
            result = completion.choices[0].message.content || "No result generated";
            console.log(`[${executionId}] Recovered result from direct completion object`);
          } else if (completion.message && typeof completion.message.content === 'string') {
            result = completion.message.content;
            console.log(`[${executionId}] Recovered result from message.content`);
          } else if (typeof completion.content === 'string') {
            result = completion.content;
            console.log(`[${executionId}] Recovered result from direct content property`);
          } else {
            console.error(`[${executionId}] Could not parse completion structure:`, JSON.stringify(completion, null, 2));
          }
        }
      }
    } catch (parseError) {
      console.error(`[${executionId}] Error parsing completion:`, parseError);
      console.error(`[${executionId}] Completion object:`, JSON.stringify(completion, null, 2));
    }
    
    // Save ESG assessment data if it's an ESG assessment and we have a user
    if (type === 'esg-assessment' && user) {
      console.log(`[${executionId}] Saving ESG assessment data`);
      await saveESGAssessment(user.id, content, result);
    }
    
    // Save chat history if it's the ESG assistant and we have a user
    if (type === 'esg-assistant' && user && result !== "No result generated") {
      console.log(`[${executionId}] Saving chat history`);
      const saved = await saveChatHistory(user.id, content, result);
      console.log(`[${executionId}] Chat history saved successfully: ${saved}`);
    }
    
    // Return the analysis result
    const response = { result, requestId: executionId };
    console.log(`[${executionId}] Sending response: ${JSON.stringify(response).substring(0, 100)}...`);
    
    return new Response(JSON.stringify(response), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
    
  } catch (error) {
    console.error(`[${executionId}] Error processing request:`, error);
    console.error(`[${executionId}] Error details:`, JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
    
    return new Response(JSON.stringify({ 
      error: error.message || "An unexpected error occurred", 
      executionId,
      stack: error.stack
    }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  }
});
