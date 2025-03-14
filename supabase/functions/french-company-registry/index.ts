
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../company-analysis/utils/cors.ts";

// Mock API for demonstration purposes, since we can't use the real INSEE API without proper credentials
const mockCompanySearch = async (companyName: string) => {
  console.log(`Searching for company: ${companyName}`);
  
  // Create a mock response based on the company name
  return {
    etablissements: [
      {
        siret: "12345678901234",
        uniteLegale: {
          siren: "123456789",
          denominationUniteLegale: companyName,
          activitePrincipaleUniteLegale: "62.01Z",
          categorieJuridiqueUniteLegale: "5499",
          dateCreationUniteLegale: "2015-01-01",
          etatAdministratifUniteLegale: "A"
        },
        adresseEtablissement: {
          numeroVoieEtablissement: "1",
          typeVoieEtablissement: "RUE",
          libelleVoieEtablissement: "DE PARIS",
          codePostalEtablissement: "75001",
          libelleCommuneEtablissement: "PARIS"
        },
        trancheEffectifsEtablissement: "11"
      }
    ]
  };
};

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
    
    // Use mock data instead of real INSEE API
    // In a production environment, you would make a real API call here
    const data = await mockCompanySearch(companyName);
    
    console.log("Received mock INSEE response");
    
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
