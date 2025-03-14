
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
    
    // Construct search query - using the correct endpoint based on INSEE API documentation
    // Note: Their API documentation shows multiple endpoints, let's try both main ones
    
    // First attempt with /siret endpoint (establishment search)
    let searchUrl = `${INSEE_API_BASE_URL}/siret`;
    let params = new URLSearchParams({
      q: `denominationUniteLegale:"${companyName}"~`,  // Using fuzzy search
      nombre: "5" // Limit results
    });
    
    console.log(`Attempting first INSEE API endpoint: ${searchUrl}?${params.toString()}`);
    
    // Make request to INSEE API
    let response = await fetch(`${searchUrl}?${params.toString()}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Accept": "application/json"
      }
    });
    
    console.log(`First INSEE endpoint response status: ${response.status}`);
    
    // If the first endpoint fails, try the uniteLegale endpoint
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`First endpoint error: ${errorText}`);
      
      // Try second endpoint (legal unit search)
      searchUrl = `${INSEE_API_BASE_URL}/siren`;
      params = new URLSearchParams({
        q: `denominationUniteLegale:"${companyName}"~`,  // Using fuzzy search
        nombre: "5" // Limit results
      });
      
      console.log(`Attempting second INSEE API endpoint: ${searchUrl}?${params.toString()}`);
      
      response = await fetch(`${searchUrl}?${params.toString()}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Accept": "application/json"
        }
      });
      
      console.log(`Second INSEE endpoint response status: ${response.status}`);
      
      // If both endpoints fail, log and use mock data in development
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Second endpoint error: ${errorText}`);
        
        if (Deno.env.get("ENVIRONMENT") === "development") {
          console.warn("Both INSEE API endpoints failed, using mock data");
          return { etablissements: [getMockCompanyData(companyName)] };
        }
        
        throw new Error(`INSEE API search failed on both endpoints: ${response.status}`);
      }
    }
    
    // Parse successful response
    const data = await response.json();
    console.log(`INSEE search results count: ${data.etablissements?.length || 0}`);
    
    // Fall back to mock data if no results found (in development)
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
