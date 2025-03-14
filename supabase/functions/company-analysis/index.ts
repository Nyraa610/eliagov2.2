
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
      console.error('OpenAI API key not found in environment variables');
      throw new Error('OpenAI API key not found in environment variables');
    }
    
    // We're using fetch directly from the request body in the CompanyOverview component
    // The companyName is expected to be in the request body
    let companyName;
    try {
      const requestData = await req.json();
      companyName = requestData.companyName;
      console.log(`Received request with companyName: ${companyName}`);
    } catch (error) {
      console.error('Error parsing request body:', error);
      throw new Error('Invalid request format');
    }
    
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
    
    // Call OpenAI API with improved parameters and organization ID
    console.log('Sending request to OpenAI API with organization ID: org-4GIKqionAIxqxOG9FvGKCib2');
    
    // Log the API key length for debugging (don't log the actual key)
    console.log(`API key length: ${openaiApiKey.length}, starts with: ${openaiApiKey.substring(0, 3)}...`);
    
    // Testing connection to OpenAI
    try {
      const testResponse = await fetch('https://api.openai.com/v1/models', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${openaiApiKey}`,
          'OpenAI-Organization': 'org-4GIKqionAIxqxOG9FvGKCib2',
        },
      });
      
      if (!testResponse.ok) {
        const errorData = await testResponse.json();
        console.error('OpenAI connection test failed:', errorData);
        throw new Error(`Failed to connect to OpenAI: ${errorData.error?.message || 'Unknown error'}`);
      } else {
        console.log('OpenAI connection test successful');
      }
    } catch (error) {
      console.error('Error testing OpenAI connection:', error);
      throw new Error(`OpenAI connection error: ${error.message}`);
    }
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
        'OpenAI-Organization': 'org-4GIKqionAIxqxOG9FvGKCib2',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini', // Using the latest mini model for better performance
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
        temperature: 0.2, // Lower temperature for more factual, consistent responses
        max_tokens: 1000, // Ensure we have enough tokens for detailed responses
        top_p: 0.9, // More focused sampling
      }),
    });
    
    // Enhanced error handling for API response
    if (!response.ok) {
      let errorMessage = 'OpenAI API error';
      try {
        const errorData = await response.json();
        console.error('OpenAI API error details:', JSON.stringify(errorData));
        errorMessage = `OpenAI API error: ${errorData.error?.message || 'Unknown API error'}`;
        
        // Check for common error types and provide specific messages
        if (errorData.error?.type === 'invalid_request_error') {
          errorMessage = `Invalid request to OpenAI API: ${errorData.error.message}`;
        } else if (errorData.error?.type === 'authentication_error') {
          errorMessage = 'OpenAI API authentication failed. Please check your API key and organization ID.';
        } else if (errorData.error?.code === 'rate_limit_exceeded') {
          errorMessage = 'OpenAI API rate limit exceeded. Please try again later.';
        }
      } catch (parseError) {
        console.error('Error parsing OpenAI error response:', parseError);
      }
      throw new Error(errorMessage);
    }
    
    const data = await response.json();
    console.log('OpenAI API response received:', JSON.stringify(data).substring(0, 200) + '...');
    
    const companyInfoText = data.choices[0]?.message?.content;
    
    if (!companyInfoText) {
      throw new Error('No response content from OpenAI');
    }
    
    console.log('Received company info from OpenAI:', companyInfoText.substring(0, 200) + '...');
    
    // Parse the JSON response from the AI with enhanced error handling
    try {
      // Extract JSON from the response (in case there's any extra text)
      const jsonMatch = companyInfoText.match(/\{[\s\S]*\}/);
      const jsonString = jsonMatch ? jsonMatch[0] : companyInfoText;
      let companyInfo;
      
      try {
        companyInfo = JSON.parse(jsonString);
        console.log('Successfully parsed JSON response');
      } catch (jsonError) {
        console.error('JSON parse error. Raw response:', companyInfoText);
        throw new Error('Failed to parse JSON from OpenAI response');
      }
      
      // Validate required fields with better fallback values
      const requiredFields = ['industry', 'employeeCount', 'history', 'mission', 'productsServices', 'location', 'yearFounded', 'overview'];
      let hasMissingFields = false;
      
      for (const field of requiredFields) {
        if (!companyInfo[field]) {
          hasMissingFields = true;
          console.warn(`Missing field in OpenAI response: ${field}`);
          // Set appropriate defaults based on field type
          switch (field) {
            case 'productsServices':
              companyInfo[field] = ['General services'];
              break;
            case 'yearFounded':
              companyInfo[field] = new Date().getFullYear() - 10; // Default to 10 years ago
              break;
            default:
              companyInfo[field] = `Information about ${field} not available`;
          }
        }
      }
      
      // Log warning if we had to fill in missing fields
      if (hasMissingFields) {
        console.warn('Some fields were missing in the OpenAI response and were populated with default values');
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
      console.error('Error processing OpenAI response:', parseError);
      console.error('Raw response excerpt:', companyInfoText.substring(0, 200) + '...');
      throw new Error(`Failed to process company information: ${parseError.message}`);
    }
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
