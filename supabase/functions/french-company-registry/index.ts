
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../company-analysis/utils/cors.ts";

// INSEE API configuration
const INSEE_API_BASE_URL = "https://api.insee.fr/entreprises/sirene/V3";
const INSEE_API_SEARCH_URL = `${INSEE_API_BASE_URL}/siret`;

// Function to get authentication token from INSEE API
async function getInseeToken() {
  try {
    const consumerKey = Deno.env.get("INSEE_CONSUMER_KEY");
    const consumerSecret = Deno.env.get("INSEE_CONSUMER_SECRET");
    
    if (!consumerKey || !consumerSecret) {
      throw new Error("INSEE API credentials not configured");
    }
    
    // Create basic auth header from consumer key and secret
    const credentials = btoa(`${consumerKey}:${consumerSecret}`);
    
    console.log("Requesting INSEE API token");
    
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
    
    let data;
    try {
      // Call the real INSEE API
      data = await searchInseeCompany(companyName);
    } catch (error) {
      // If INSEE API fails, return error response
      console.error("INSEE API error:", error.message);
      return new Response(
        JSON.stringify({ 
          error: `INSEE API error: ${error.message}`
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }
    
    console.log("Received INSEE API response");
    
    if (!data.etablissements || data.etablissements.length === 0) {
      console.log("No company found with the given name");
      return new Response(
        JSON.stringify({ 
          message: "No company found with the given name",
          data: null
        }), 
        { 
          status: 200, // Return 200 even if no results
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }
    
    // Extract and structure the relevant information from the first result
    const firstEstablishment = data.etablissements[0];
    const uniteLegale = firstEstablishment.uniteLegale;
    
    const companyInfo = {
      siret: firstEstablishment.siret,
      siren: uniteLegale.siren,
      name: uniteLegale.denominationUniteLegale || `${uniteLegale.prenomUsuelUniteLegale || ''} ${uniteLegale.nomUniteLegale || ''}`.trim(),
      address: formatAddress(firstEstablishment.adresseEtablissement),
      activityCode: uniteLegale.activitePrincipaleUniteLegale,
      legalForm: uniteLegale.categorieJuridiqueUniteLegale,
      creationDate: uniteLegale.dateCreationUniteLegale,
      employeeCount: getEmployeeRangeLabel(firstEstablishment.trancheEffectifsEtablissement),
      status: uniteLegale.etatAdministratifUniteLegale === "A" ? "Active" : "Closed"
    };
    
    console.log("Successfully processed French company registry data", companyInfo);
    
    return new Response(
      JSON.stringify({ 
        message: "Company information retrieved from French registry",
        data: companyInfo
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
