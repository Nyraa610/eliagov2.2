
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "./utils/cors.ts";
import { searchInseeCompany } from "./services/inseeApi.ts";
import { formatAddress } from "./utils/formatters.ts";

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
    
    // Search INSEE API for company data
    const searchResults = await searchInseeCompany(companyName);
    
    if (!searchResults.etablissements || searchResults.etablissements.length === 0) {
      return new Response(
        JSON.stringify({
          message: "No companies found in French registry",
          data: null
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }
    
    // Get first result and format it
    const company = searchResults.etablissements[0];
    const formattedCompany = {
      siret: company.siret,
      siren: company.siren,
      name: company.uniteLegale.denominationUniteLegale,
      address: formatAddress(company.adresseEtablissement),
      activityCode: company.uniteLegale.activitePrincipaleUniteLegale,
      legalForm: company.uniteLegale.categorieJuridiqueUniteLegale,
      creationDate: company.dateCreationEtablissement,
      employeeCount: company.trancheEffectifsEtablissement,
      status: company.uniteLegale.etatAdministratifUniteLegale === "A" ? "Active" : "Inactive"
    };
    
    return new Response(
      JSON.stringify({ 
        message: "Company information retrieved from French registry",
        data: formattedCompany
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
