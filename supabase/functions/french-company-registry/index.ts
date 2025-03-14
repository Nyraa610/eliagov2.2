
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "./utils/cors.ts";
import { searchInseeCompany } from "./services/inseeApi.ts";
import { getMockCompanyData } from "./services/mockData.ts";

serve(async (req) => {
  console.log("Edge function invoked: french-company-registry");
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log("Handling OPTIONS request with CORS headers");
    return new Response(null, {
      headers: corsHeaders,
    });
  }
  
  try {
    // Parse request body to get company name
    let requestData;
    try {
      requestData = await req.json();
    } catch (error) {
      console.error("Failed to parse request JSON:", error);
      return new Response(
        JSON.stringify({ 
          error: "Invalid request format. Expected JSON body."
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }
    
    const { companyName } = requestData;
    
    if (!companyName) {
      console.error("Missing companyName in request");
      return new Response(
        JSON.stringify({ 
          error: "Company name is required"
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }
    
    console.log(`Searching for company: ${companyName}`);
    
    // For now, we'll use mock data since the certificate-based authentication is complex
    // and requires additional setup in the Supabase environment
    const companyData = getMockCompanyData(companyName);
    
    return new Response(
      JSON.stringify({ 
        message: "Company information retrieved from French registry (mock data)",
        data: companyData
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Error in french-company-registry function:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'An unexpected error occurred when accessing the French company registry',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
