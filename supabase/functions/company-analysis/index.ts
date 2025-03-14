
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Configuration, OpenAIApi } from "https://esm.sh/openai@3.2.1";

// Initialize Supabase client
const supabaseClient = createClient(
  Deno.env.get("SUPABASE_URL") as string,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") as string
);

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
    // Verify JWT token
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'No authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Get OpenAI API key
    const openAIApiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openAIApiKey) {
      return new Response(JSON.stringify({ error: "OpenAI API key not configured" }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Parse request
    const { companyName } = await req.json();
    if (!companyName) {
      return new Response(JSON.stringify({ error: "Company name is required" }), { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Initialize OpenAI
    const configuration = new Configuration({ apiKey: openAIApiKey });
    const openai = new OpenAIApi(configuration);

    // Create system prompt
    const systemPrompt = `You are a business analyst who provides concise, factual information about companies.
Based on the company name provided, generate a business profile with the following information:
1. Industry (single specific category)
2. Company size (choose one: 1-10, 11-50, 51-250, 251-1000, or 1000+)
3. Brief company history (2-3 sentences)
4. Mission statement (1 sentence)
5. Main products/services (2-3 bullet points)
6. Headquarters location
7. Year founded (estimate if unsure)

Format the response as a JSON object with these fields:
{
  "industry": "string",
  "employeeCount": "string" (must be one of: "1-10", "11-50", "51-250", "251-1000", "1000+"),
  "history": "string",
  "mission": "string",
  "productsServices": ["string", "string"],
  "location": "string",
  "yearFounded": number,
  "overview": "string" (a 2-3 sentence summary of all the above information)
}

If you don't have enough information about the company, make an educated guess based on the company name,
but keep your response factual in tone.`;

    // Call OpenAI
    const completion = await openai.createChatCompletion({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Company name: ${companyName}` }
      ],
      temperature: 0.7,
    });

    let companyInfo;
    try {
      const content = completion.data.choices[0]?.message?.content || "{}";
      companyInfo = JSON.parse(content);
      
      // Validate the response format
      if (!companyInfo.industry || !companyInfo.employeeCount) {
        throw new Error("Invalid response format");
      }
    } catch (error) {
      console.error("Error parsing OpenAI response:", error);
      return new Response(JSON.stringify({ error: "Failed to parse company information" }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Return the company information
    return new Response(JSON.stringify({ companyInfo }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error("Error in company-analysis function:", error);
    return new Response(JSON.stringify({ error: error.message || "An unexpected error occurred" }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
