
/**
 * INSEE API service
 * Handles communicating with the INSEE API for company information
 */
import { getInseeToken } from "./auth.ts";
import { getMockCompanyData } from "./mockData.ts";

// INSEE API configuration
const INSEE_API_BASE_URL = "https://api.insee.fr/entreprises/sirene/V3";

/**
 * Search for companies in the INSEE registry
 * @param companyName The name of the company to search for
 * @returns Promise with the search results
 */
export async function searchInseeCompany(companyName: string) {
  try {
    // Get API key
    const apiKey = await getInseeToken();
    
    if (!apiKey) {
      throw new Error("Failed to obtain INSEE API key");
    }
    
    // Construct search query
    // According to INSEE API docs, we need to search by denomination (company name)
    // Reference: https://portail-api.insee.fr/catalog/api/2ba0e549-5587-3ef1-9082-99cd865de66f/doc
    const searchUrl = `${INSEE_API_BASE_URL}/siret`;
    
    // Build a proper query parameter for raison sociale (company name)
    // Using Q parameter as per API documentation
    const params = new URLSearchParams({
      q: `denominationUniteLegale:"${companyName}"~`,  // Using fuzzy search with tilde
      nombre: "5", // Limit results to 5
      champs: "siret,siren,denominationUniteLegale,adresseEtablissement,dateCreationEtablissement,trancheEffectifsEtablissement,activitePrincipaleUniteLegale,categorieJuridiqueUniteLegale,etatAdministratifUniteLegale"
    });
    
    const fullUrl = `${searchUrl}?${params.toString()}`;
    console.log(`Searching INSEE API: ${fullUrl}`);
    
    // Make request to INSEE API with API key as Bearer token
    const response = await fetch(fullUrl, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Accept": "application/json"
      }
    });
    
    console.log(`INSEE search request status: ${response.status}`);
    
    if (!response.ok) {
      const errorBody = await response.text();
      console.error("INSEE search error response:", errorBody);
      
      // If API call fails, fall back to mock data in development
      if (Deno.env.get("ENVIRONMENT") === "development") {
        console.warn("Falling back to mock data due to API error");
        return { etablissements: [getMockCompanyData(companyName)] };
      }
      
      throw new Error(`INSEE API search failed: ${response.status} ${response.statusText}\nError body: ${errorBody}`);
    }
    
    const data = await response.json();
    console.log(`INSEE search results count: ${data.etablissements?.length || 0}`);
    
    // If no results are found, we can optionally fall back to mock data in development
    if ((!data.etablissements || data.etablissements.length === 0) && 
        Deno.env.get("ENVIRONMENT") === "development") {
      console.warn("No results found in INSEE API, using mock data");
      return { etablissements: [getMockCompanyData(companyName)] };
    }
    
    return data;
  } catch (error) {
    console.error("Error searching INSEE registry:", error);
    
    // In production, propagate the error
    if (Deno.env.get("ENVIRONMENT") !== "development") {
      throw error;
    }
    
    // In development, fall back to mock data
    console.warn("Falling back to mock data due to error");
    return { etablissements: [getMockCompanyData(companyName)] };
  }
}
