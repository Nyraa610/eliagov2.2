
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { AIAnalysisRequest } from "./handlers/types.ts";
import { verifyAuth, corsHeaders } from "./handlers/auth.ts";
import { initializeOpenAI, getSystemPrompt, createChatCompletion } from "./handlers/openai.ts";
import { saveChatHistory, saveESGAssessment } from "./handlers/database.ts";

serve(async (req) => {
  // Generate a request ID for tracking this request
  const requestId = crypto.randomUUID();
  console.log(`Starting AI Analysis request. Request ID: ${requestId}`);
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log(`Handling CORS preflight request. Request ID: ${requestId}`);
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify authentication
    console.log(`Verifying authentication. Request ID: ${requestId}`);
    const authHeader = req.headers.get('Authorization');
    
    try {
      const user = await verifyAuth(authHeader);
      console.log(`Authentication successful for user: ${user.id.substring(0, 8)}... Request ID: ${requestId}`);
    } catch (authError) {
      console.error(`Authentication error. Request ID: ${requestId}`, authError);
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // Parse request body
    console.log(`Parsing request body. Request ID: ${requestId}`);
    const requestData: AIAnalysisRequest = await req.json();
    
    // Add request ID to tracking
    requestData.requestId = requestId;
    
    console.log(`Processing AI Analysis request: ${JSON.stringify({
      type: requestData.type,
      analysisType: requestData.analysisType,
      contentLength: requestData.content?.length || 0,
      contextLength: requestData.context?.length || 0,
      requestId: requestId
    })}`);
    
    // Initialize OpenAI client
    console.log(`Initializing OpenAI client. Request ID: ${requestId}`);
    const openai = initializeOpenAI();
    
    // Get system prompt based on type
    console.log(`Getting system prompt for type: ${requestData.type}, analysisType: ${requestData.analysisType || 'none'}. Request ID: ${requestId}`);
    const systemPrompt = getSystemPrompt(requestData.type, requestData.analysisType);
    
    // Prepare messages for OpenAI
    const messages = [
      { role: "system", content: systemPrompt },
      { role: "user", content: requestData.content }
    ];
    
    // Add conversation context if provided
    if (requestData.context && requestData.context.length > 0) {
      console.log(`Adding ${requestData.context.length} context messages. Request ID: ${requestId}`);
      messages.push(...requestData.context);
    }
    
    // Call OpenAI
    console.log(`Calling OpenAI with ${messages.length} messages. Request ID: ${requestId}`);
    const response = await createChatCompletion(openai, messages, requestData.type, requestId);
    
    console.log(`OpenAI response received: ${response && response.data ? 'object has data' : 'no data'}. Request ID: ${requestId}`);
    
    // Extract result
    const responseContent = response.data.choices[0].message.content;
    console.log(`Response content type: ${typeof responseContent}. Request ID: ${requestId}`);
    
    const result = responseContent;
    console.log(`Extracted result: ${result.substring(0, 100)}... Request ID: ${requestId}`);
    
    // Save chat history if it's a conversation
    if (requestData.type === 'esg-assistant') {
      console.log(`Saving chat history. Request ID: ${requestId}`);
      const authHeader = req.headers.get('Authorization');
      if (authHeader) {
        const user = await verifyAuth(authHeader);
        const savedSuccessfully = await saveChatHistory(user.id, requestData.content, result);
        console.log(`Chat history saved successfully: ${savedSuccessfully}. Request ID: ${requestId}`);
      }
    }
    
    // Save ESG assessment if it's an assessment
    if (requestData.type === 'esg-assessment') {
      console.log(`Saving ESG assessment. Request ID: ${requestId}`);
      const authHeader = req.headers.get('Authorization');
      if (authHeader) {
        const user = await verifyAuth(authHeader);
        const savedSuccessfully = await saveESGAssessment(user.id, requestData.content, result);
        console.log(`ESG assessment saved successfully: ${savedSuccessfully}. Request ID: ${requestId}`);
      }
    }
    
    console.log(`Sending response: ${JSON.stringify({ result: result.substring(0, 100) + '...' })}. Request ID: ${requestId}`);
    
    return new Response(
      JSON.stringify({ result }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
    
  } catch (error) {
    console.error(`Error in AI analysis (Request ID: ${requestId}):`, error);
    
    return new Response(
      JSON.stringify({ error: `Analysis failed: ${error.message}`, requestId: requestId }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});
