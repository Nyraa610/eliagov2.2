
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders,
    });
  }
  
  try {
    // Get OpenAI API key from environment variables
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      throw new Error('OpenAI API key not found in environment variables');
    }
    
    // Parse request data
    const { companyName } = await req.json();
    
    if (!companyName) {
      return new Response(
        JSON.stringify({ error: 'Company name is required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }
    
    console.log(`Processing company analysis request for: ${companyName}`);
    
    // Define system prompt for company analysis
    const systemPrompt = `You are a professional business analyst with expertise in company research and ESG (Environmental, Social, Governance) analysis. 
    
Your task is to provide a detailed, accurate profile of the company name provided, focusing on factual information.

Instructions:
1. Research and present factual information about the company.
2. If the company is well-known, provide accurate information based on public knowledge.
3. If the company is not recognizable or might be fictional, make reasonable estimates based on the company name and possible industry, but keep the information realistic and plausible.
4. Structure your response as JSON matching exactly the format below.
5. Ensure all fields are filled appropriately - never leave any field empty.
6. Be concise but informative in each section.

JSON Response Format:
{
  "industry": "The company's primary industry or sector",
  "employeeCount": "Estimate of employee count (use ranges like '1-10', '11-50', '51-250', '251-1000', '1000+')",
  "history": "A brief 2-3 sentence history of the company",
  "mission": "The company's mission statement or core purpose",
  "productsServices": ["List", "of", "main", "products", "or", "services"],
  "location": "Headquarters location (city, country)",
  "yearFounded": YYYY (numeric year only, no quotes),
  "overview": "A concise 3-4 sentence overview of the company's business, market position, and significance in its industry"
}`;
    
    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { 
            role: 'system', 
            content: systemPrompt 
          },
          { 
            role: 'user', 
            content: `Research and provide a company profile for: ${companyName}` 
          }
        ],
        temperature: 0.5, // Lower temperature for more factual responses
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
    }
    
    const data = await response.json();
    const companyInfoText = data.choices[0]?.message?.content;
    
    if (!companyInfoText) {
      throw new Error('No response content from OpenAI');
    }
    
    console.log('Received company info from OpenAI');
    
    // Parse the JSON response from the AI
    try {
      // Extract JSON from the response (in case there's any extra text)
      const jsonMatch = companyInfoText.match(/\{[\s\S]*\}/);
      const jsonString = jsonMatch ? jsonMatch[0] : companyInfoText;
      const companyInfo = JSON.parse(jsonString);
      
      // Validate required fields
      const requiredFields = ['industry', 'employeeCount', 'history', 'mission', 'productsServices', 'location', 'yearFounded', 'overview'];
      for (const field of requiredFields) {
        if (!companyInfo[field]) {
          companyInfo[field] = field === 'productsServices' ? ['General services'] : 'Information not available';
        }
      }
      
      // Ensure yearFounded is a number
      if (typeof companyInfo.yearFounded !== 'number') {
        companyInfo.yearFounded = parseInt(companyInfo.yearFounded) || new Date().getFullYear() - 10;
      }
      
      // Ensure productsServices is an array
      if (!Array.isArray(companyInfo.productsServices)) {
        companyInfo.productsServices = [companyInfo.productsServices || 'General services'];
      }
      
      console.log('Successfully processed company info');
      
      return new Response(
        JSON.stringify({ companyInfo }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    } catch (parseError) {
      console.error('Error parsing OpenAI response:', parseError);
      console.error('Raw response:', companyInfoText);
      throw new Error(`Failed to parse company information: ${parseError.message}`);
    }
  } catch (error) {
    console.error('Error in company-analysis function:', error);
    
    return new Response(
      JSON.stringify({ error: error.message || 'An unexpected error occurred' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
