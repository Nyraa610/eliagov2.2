
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { ChatCompletionRequestMessage, Configuration, OpenAIApi } from "https://esm.sh/openai@3.2.1";

// Type definitions for our request
interface AIAnalysisRequest {
  type: 'course-summary' | 'esg-assessment' | 'esg-assistant';
  content: string;
  context?: any[];
  analysisType?: 'integrated';
  additionalParams?: Record<string, any>;
}

// Initialize Supabase client
const supabaseClient = createClient(
  Deno.env.get("SUPABASE_URL") as string,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") as string
);

// Save ESG assessment data
async function saveESGAssessment(userId: string, content: string, result: string) {
  try {
    const { data, error } = await supabaseClient
      .from('assessment_progress')
      .insert({
        user_id: userId,
        assessment_type: 'esg_diagnostic',
        status: 'completed',
        progress: 100,
        form_data: { 
          content, 
          analysis_result: result,
          completed_at: new Date().toISOString()
        }
      });

    if (error) {
      console.error("Error saving ESG assessment:", error);
    }

    return data;
  } catch (err) {
    console.error("Exception saving ESG assessment:", err);
    return null;
  }
}

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
    const { type, content, context, analysisType } = requestData;
    
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
      systemPrompt = `You are Elia, an ESG (Environmental, Social, Governance) expert consultant analyzing corporate sustainability practices. ${
        analysisType === 'integrated' ? "You're part of an integrated ESG/RSE diagnostic journey that helps companies understand and improve their sustainability practices." : ""
      } Based on the information provided, create a comprehensive ESG diagnostic report with these sections:

1. EXECUTIVE SUMMARY
   - Brief overview of the company's current ESG maturity level
   - Quick highlights of key strengths and areas for improvement

2. DETAILED ASSESSMENT
   - Environmental: Evaluate waste management, carbon footprint, energy efficiency
   - Social: Evaluate employee practices, community engagement, diversity & inclusion
   - Governance: Evaluate board oversight, transparency, ethical decision-making

3. BENCHMARKING
   - Compare the company's practices with industry standards and frameworks (ISO 26000, CSRD, etc.)
   - Identify where the company stands relative to peers

4. RECOMMENDATIONS
   - High-priority actions (immediate term, 0-6 months)
   - Medium-priority actions (short term, 6-12 months)
   - Long-term strategic initiatives (1-3 years)

5. IMPLEMENTATION ROADMAP
   - Key performance indicators (KPIs) to track progress
   - Suggested timeline for implementation
   - Resource requirements

Format your analysis professionally with clear headings and bullet points where appropriate. Provide specific, actionable guidance tailored to the company's industry, size, and current practices.`;
    } else if (type === 'esg-assistant') {
      systemPrompt = `You are Elia, an AI assistant specializing in ESG (Environmental, Social, Governance) and RSE (Responsabilité Sociétale des Entreprises) assessments. 

Your personality traits:
- Professional but approachable
- Patient and educational - you explain complex ESG concepts in simple terms
- Solutions-oriented - you provide practical advice 
- Supportive - you encourage companies on their sustainability journey

Your knowledge areas:
- ESG frameworks and standards (GRI, SASB, TCFD, CSRD, etc.)
- Sustainability reporting and compliance
- Carbon accounting and climate strategies
- Social responsibility best practices
- Corporate governance structures
- Industry-specific sustainability challenges

When answering questions:
- Keep responses concise and focused
- Provide actionable advice when possible
- Refer to relevant frameworks or standards when appropriate
- Use bullet points for clarity when listing multiple points
- Acknowledge when certain questions might need more specialized expertise

Avoid:
- Giving overly generic advice
- Making specific financial predictions
- Claiming to replace human ESG consultants`;
    } else {
      return new Response(JSON.stringify({ error: "Invalid analysis type" }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Define messages for OpenAI chat completion
    let messages: ChatCompletionRequestMessage[] = [
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
    messages.push({ role: "user", content: userPrompt });
    
    // Call OpenAI API
    const completion = await openai.createChatCompletion({
      model: "gpt-4o-mini", // Using a cost-effective model
      messages: messages,
      temperature: type === 'esg-assistant' ? 0.8 : 0.7, // Slightly higher temp for chat
      max_tokens: type === 'esg-assistant' ? 800 : 2000, // Shorter responses for chat
    });
    
    const result = completion.data.choices[0]?.message?.content || "No result generated";
    
    // Save ESG assessment data if it's an ESG assessment
    if (type === 'esg-assessment') {
      await saveESGAssessment(user.id, content, result);
    }
    
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
