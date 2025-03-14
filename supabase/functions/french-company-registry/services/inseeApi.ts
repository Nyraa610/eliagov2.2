
/**
 * INSEE API service
 * Handles communicating with the INSEE API for company information
 */
import { getInseeToken } from "./auth.ts";
import { getMockCompanyData } from "./mockData.ts";

// INSEE API configuration - updated to use the latest 3.11 API endpoint
const INSEE_API_BASE_URL = "https://api.insee.fr/api-sirene/3.11";

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
    
    // Construct search URL using the specific SIREN endpoint format
    // Based on documentation example: https://api.insee.fr/api-sirene/3.11/siren/[siren-number]
    // For search by name, we'll use the appropriate query parameters
    const searchUrl = `${INSEE_API_BASE_URL}/siren`;
    
    // Use the correct query parameter format for the 3.11 API version
    const params = new URLSearchParams({
      q: `denominationUniteLegale:"${companyName}"~`,  // Using fuzzy search
      nombre: "5" // Limit results
    });
    
    console.log(`Attempting INSEE API search: ${searchUrl}?${params.toString()}`);
    console.log(`Using headers: X-INSEE-Api-Key-Integration: [API KEY HIDDEN]`);
    
    // Make request to INSEE API with detailed logging and CORRECT HEADER FORMAT
    const response = await fetch(`${searchUrl}?${params.toString()}`, {
      method: "GET",
      headers: {
        // Using the correct header format as shown in the documentation
        "X-INSEE-Api-Key-Integration": apiKey,
        "Accept": "application/json"
      }
    });
    
    console.log(`INSEE API response status: ${response.status}`);
    
    // If the request failed, log the error and throw an exception or use mock data
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`INSEE API error (${response.status}): ${errorText}`);
      
      // In development environment, use mock data
      if (Deno.env.get("ENVIRONMENT") === "development") {
        console.warn("INSEE API request failed, using mock data");
        return { etablissements: [getMockCompanyData(companyName)] };
      }
      
      throw new Error(`INSEE API search failed: ${response.status} - ${errorText.substring(0, 200)}`);
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
