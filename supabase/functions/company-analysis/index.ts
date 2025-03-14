
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { corsHeaders } from "./utils/cors.ts";
import { validateCompanyName, validateOpenAIKey } from "./utils/validation.ts";
import { analyzeCompany } from "./handlers/openai.ts";
import { processCompanyInfo } from "./services/companyService.ts";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders,
    });
  }
  
  try {
    // Validate OpenAI API key
    const openaiApiKey = validateOpenAIKey();
    
    // Parse request body and validate company name
    let companyName;
    try {
      const requestData = await req.json();
      companyName = validateCompanyName(requestData);
      console.log(`Received request with companyName: ${companyName}`);
    } catch (error) {
      console.error('Error parsing request body:', error);
      throw new Error('Invalid request format');
    }
    
    console.log(`Processing company analysis request for: ${companyName}`);
    
    // Call OpenAI to get company analysis
    const data = await analyzeCompany(companyName, openaiApiKey);
    
    // Extract and process company info from OpenAI response
    const companyInfoText = data.choices[0]?.message?.content;
    const companyInfo = processCompanyInfo(companyInfoText);
    
    return new Response(
      JSON.stringify({ companyInfo }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Error in company-analysis function:', error);
    
    // Create a more user-friendly error message based on error type
    let userMessage = 'An unexpected error occurred during company analysis';
    let statusCode = 500;
    
    if (error.message.includes('API key')) {
      userMessage = 'Configuration error: OpenAI API key issue';
    } else if (error.message.includes('rate limit')) {
      userMessage = 'The analysis service is currently at capacity. Please try again in a few minutes.';
      statusCode = 429;
    } else if (error.message.includes('parse')) {
      userMessage = 'Error processing the company information. Our team has been notified.';
    } else if (error.message.includes('connect to OpenAI')) {
      userMessage = 'Unable to connect to the analysis service. Please check your internet connection and try again.';
    }
    
    return new Response(
      JSON.stringify({ 
        error: userMessage,
        details: error.message 
      }),
      {
        status: statusCode,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
