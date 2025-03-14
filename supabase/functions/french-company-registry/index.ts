
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../company-analysis/utils/cors.ts";

const INSEE_CLIENT_ID = "nH3$kT8vL!xZ9pQmB2yV@c4dR7fW#aM5";
const INSEE_API_URL = "https://api.insee.fr/entreprises/sirene/V3";

interface CompanyRegistryResult {
  siret?: string;
  siren?: string;
  name?: string;
  address?: string;
  activityCode?: string;
  legalForm?: string;
  creationDate?: string;
  employeeCount?: string;
  status?: string;
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
    const requestData = await req.json();
    const { companyName } = requestData;
    
    if (!companyName) {
      throw new Error("Company name is required");
    }
    
    console.log(`Searching French registry for company: ${companyName}`);
    
    // Create the search query for the INSEE API
    // We need to encode the company name for the URL
    const encodedCompanyName = encodeURIComponent(companyName.trim());
    const searchUrl = `${INSEE_API_URL}/siret?q=denominationUniteLegale:"${encodedCompanyName}"`;
    
    // Make the request to INSEE API
    const response = await fetch(searchUrl, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${INSEE_CLIENT_ID}`,
        "Accept": "application/json"
      }
    });
    
    if (!response.ok) {
      // Handle different error scenarios
      if (response.status === 401) {
        console.error("Authentication error with INSEE API:", await response.text());
        throw new Error("Authentication failed with the French company registry API");
      } else if (response.status === 404) {
        console.log("No company found with the given name");
        return new Response(
          JSON.stringify({ 
            message: "No company found in the French registry with the given name",
            data: null
          }), 
          { 
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      } else {
        console.error(`INSEE API error (${response.status}):`, await response.text());
        throw new Error(`Error from the French company registry API: ${response.status}`);
      }
    }
    
    // Parse the response
    const data = await response.json();
    console.log("INSEE API response received, processing data");
    
    if (!data.etablissements || data.etablissements.length === 0) {
      return new Response(
        JSON.stringify({ 
          message: "No company found in the French registry with the given name",
          data: null
        }), 
        { 
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }
    
    // Extract and structure the relevant information from the first result
    const firstEstablishment = data.etablissements[0];
    const uniteLegale = firstEstablishment.uniteLegale;
    
    const companyInfo: CompanyRegistryResult = {
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
