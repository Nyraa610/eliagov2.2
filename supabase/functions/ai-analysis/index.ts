
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { ChatCompletionRequestMessage, Configuration, OpenAIApi } from "https://esm.sh/openai@3.2.1";

// Type definitions for our request
interface AIAnalysisRequest {
  type: 'course-summary' | 'esg-assessment';
  content: string;
  additionalParams?: Record<string, any>;
}

// Initialize Supabase client
const supabaseClient = createClient(
  Deno.env.get("SUPABASE_URL") as string,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") as string
);

serve(async (req) => {
  try {
    // Handle CORS for preflight requests
    if (req.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST",
          "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
        },
      });
    }
    
    // Verify JWT token
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'No authorization header' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Get OpenAI API key from environment
    const openAIApiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openAIApiKey) {
      return new Response(JSON.stringify({ error: "OpenAI API key not configured" }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Parse request body
    const requestData: AIAnalysisRequest = await req.json();
    const { type, content } = requestData;
    
    if (!type || !content) {
      return new Response(JSON.stringify({ error: "Missing required fields: type or content" }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Configure OpenAI
    const configuration = new Configuration({ apiKey: openAIApiKey });
    const openai = new OpenAIApi(configuration);
    
    // Prepare messages based on analysis type
    let systemPrompt: string;
    let userPrompt: string = content;
    
    if (type === 'course-summary') {
      systemPrompt = "You are an educational expert that creates concise and engaging summaries of course content. Your summaries should highlight key learning objectives, main topics, and the value the course offers to students.";
    } else if (type === 'esg-assessment') {
      systemPrompt = "You are an ESG (Environmental, Social, Governance) expert consultant analyzing corporate sustainability practices. Provide a structured assessment that includes strengths, areas for improvement, and actionable recommendations.";
    } else {
      return new Response(JSON.stringify({ error: "Invalid analysis type" }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Define messages for OpenAI chat completion
    const messages: ChatCompletionRequestMessage[] = [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
    ];
    
    // Call OpenAI API
    const completion = await openai.createChatCompletion({
      model: "gpt-4o-mini", // Using a cost-effective model
      messages: messages,
      temperature: 0.7,
      max_tokens: 1500,
    });
    
    const result = completion.data.choices[0]?.message?.content || "No result generated";
    
    // Return the analysis result
    return new Response(JSON.stringify({ result }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
      },
    });
    
  } catch (error) {
    console.error("Error processing request:", error);
    
    return new Response(JSON.stringify({ error: error.message || "An unexpected error occurred" }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }
});
