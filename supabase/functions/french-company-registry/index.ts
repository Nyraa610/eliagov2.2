
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../company-analysis/utils/cors.ts";

// INSEE API configuration
const INSEE_API_BASE_URL = "https://api.insee.fr/entreprises/sirene/V3";
const INSEE_API_SEARCH_URL = `${INSEE_API_BASE_URL}/siret`;

// Function to get authentication token from INSEE API using client certificate
async function getInseeToken() {
  try {
    const clientId = Deno.env.get("INSEE_CLIENT_ID");
    
    if (!clientId) {
      throw new Error("INSEE API client ID not configured");
    }
    
    console.log("Requesting INSEE API token with client certificate");
    
    // For client certificate authentication, we would need to use a more complex fetch
    // with the certificate included, but Deno's fetch doesn't directly support client certificates
    // So we'll need to use the token endpoint that supports client_id + client_secret auth flow
    // using the client_id as the username
    const credentials = btoa(`${clientId}:client_secret`);
    
    const response = await fetch("https://api.insee.fr/token", {
      method: "POST",
      headers: {
        "Authorization": `Basic ${credentials}`,
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: "grant_type=client_credentials"
    });
    
    console.log(`INSEE token request status: ${response.status}`);
    
    if (!response.ok) {
      const errorBody = await response.text();
      console.error("INSEE token error response:", errorBody);
      throw new Error(`Failed to get INSEE API token: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log("INSEE token obtained successfully");
    
    return data.access_token;
  } catch (error) {
    console.error("Error getting INSEE token:", error);
    throw error;
  }
}

// Function to search companies in INSEE registry
async function searchInseeCompany(companyName: string) {
  try {
    // Get authentication token
    const token = await getInseeToken();
    
    if (!token) {
      throw new Error("Failed to obtain INSEE API token");
    }
    
    // Construct search query
    // Using Q parameter to search by name (denomination)
    const params = new URLSearchParams({
      q: `denomination:"${companyName}"`,
      nombre: "5" // Limit results to 5
    });
    
    const searchUrl = `${INSEE_API_SEARCH_URL}?${params.toString()}`;
    console.log(`Searching INSEE API: ${searchUrl}`);
    
    // Make request to INSEE API
    const response = await fetch(searchUrl, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Accept": "application/json"
      }
    });
    
    console.log(`INSEE search request status: ${response.status}`);
    
    if (!response.ok) {
      const errorBody = await response.text();
      console.error("INSEE search error response:", errorBody);
      throw new Error(`INSEE API search failed: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log(`INSEE search results count: ${data.etablissements?.length || 0}`);
    
    return data;
  } catch (error) {
    console.error("Error searching INSEE registry:", error);
    throw error;
  }
}

// Helper function to format address from the INSEE API response
function formatAddress(adresseData: any): string {
  if (!adresseData) return "Address not available";
  
  const parts = [
    adresseData.numeroVoieEtablissement,
    adresseData.typeVoieEtablissement,
    adresseData.libelleVoieEtablissement,
    adresseData.codePostalEtablissement,
    adresseData.libelleCommuneEtablissement
  ];
  
  return parts.filter(part => part).join(" ");
}

// Helper function to convert employee count code to a human-readable range
function getEmployeeRangeLabel(trancheEffectif: string): string {
  const ranges: Record<string, string> = {
    "NN": "Not specified",
    "00": "0 employees",
    "01": "1-2 employees",
    "02": "3-5 employees",
    "03": "6-9 employees",
    "11": "10-19 employees",
    "12": "20-49 employees",
    "21": "50-99 employees",
    "22": "100-199 employees",
    "31": "200-249 employees",
    "32": "250-499 employees",
    "41": "500-999 employees",
    "42": "1000-1999 employees",
    "51": "2000-4999 employees",
    "52": "5000+ employees"
  };
  
  return ranges[trancheEffectif] || "Unknown";
}

// Since we don't have actual API access with the correct authentication method,
// we'll provide sample data to demonstrate the functionality
function getMockCompanyData(companyName: string) {
  // Create a mock company based on the search term
  const mockCompany = {
    siret: "12345678901234",
    siren: "123456789",
    name: companyName,
    address: "123 Rue de Paris, 75001 Paris",
    activityCode: "62.01Z",
    legalForm: "5710",
    creationDate: "2010-01-01",
    employeeCount: "20-49 employees",
    status: "Active"
  };
  
  console.log(`Returning mock data for company: ${companyName}`);
  return mockCompany;
}

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
