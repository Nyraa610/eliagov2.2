
import { supabase } from "@/lib/supabase";

export interface CompanyAnalysisResult {
  industry: string;
  employeeCount: string;
  history: string;
  mission: string;
  productsServices: string[];
  location: string;
  yearFounded: number;
  overview: string;
  // French registry specific data
  siren?: string;
  siret?: string;
  legalForm?: string;
  activityCode?: string;
  registryStatus?: string;
}

export const companyAnalysisService = {
  /**
   * Get company analysis based on company name
   * @param companyName The name of the company to analyze
   * @param country Optional country where the company is based
   * @returns Promise with company analysis result
   */
  getCompanyAnalysis: async (companyName: string, country?: string): Promise<CompanyAnalysisResult> => {
    try {
      console.log(`Requesting analysis for company: ${companyName}, Country: ${country || 'not specified'}`);
      
      // For French companies, try to get data from the French registry first
      let frenchRegistryData = null;
      if (country && ['france', 'FRANCE', 'France', 'FR', 'fr'].includes(country)) {
        try {
          console.log("Attempting to fetch data from French company registry");
          const { data: registryResponse, error: registryError } = await supabase.functions.invoke('french-company-registry', {
            body: { companyName }
          });
          
          if (registryError) {
            console.warn("Error from French registry function:", registryError);
          } else if (registryResponse && registryResponse.data) {
            console.log("Successfully retrieved data from French registry:", registryResponse.data);
            frenchRegistryData = registryResponse.data;
          }
        } catch (registryError) {
          console.warn("Failed to get data from French registry:", registryError);
          // Continue with AI analysis even if the registry lookup fails
        }
      }
      
      // Make sure we're sending a proper JSON payload
      const { data, error } = await supabase.functions.invoke('company-analysis', {
        body: { 
          companyName, 
          country,
          // Pass the French registry data if available
          registryData: frenchRegistryData 
        }
      });
      
      // Handle edge function errors
      if (error) {
        console.error("Error from edge function:", error);
        throw new Error(`Edge function error: ${error.message}`);
      }
      
      // Validate response format
      if (!data || !data.companyInfo) {
        console.error("Invalid response format:", data);
        throw new Error("Invalid response format from analysis service");
      }
      
      // Merge in the French registry data if available
      let companyInfo = data.companyInfo as CompanyAnalysisResult;
      
      if (frenchRegistryData) {
        companyInfo = {
          ...companyInfo,
          siren: frenchRegistryData.siren,
          siret: frenchRegistryData.siret,
          legalForm: frenchRegistryData.legalForm,
          activityCode: frenchRegistryData.activityCode,
          registryStatus: frenchRegistryData.status,
          // Override the AI-generated employee count with official data if available
          ...(frenchRegistryData.employeeCount && { employeeCount: frenchRegistryData.employeeCount })
        };
      }
      
      console.log("Company analysis completed successfully");
      return companyInfo;
    } catch (error) {
      console.error("Error in Company Analysis:", error);
      throw new Error(error instanceof Error 
        ? `Failed to analyze company: ${error.message}` 
        : "Failed to analyze company information. Please try again.");
    }
  }
};
