
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
}

export const companyAnalysisService = {
  /**
   * Get company analysis based on company name
   * @param companyName The name of the company to analyze
   * @returns Promise with company analysis result
   */
  getCompanyAnalysis: async (companyName: string): Promise<CompanyAnalysisResult> => {
    try {
      console.log(`Requesting analysis for company: ${companyName}`);
      
      const { data, error } = await supabase.functions.invoke('company-analysis', {
        body: { companyName }
      });
      
      if (error) {
        console.error("Error from edge function:", error);
        throw new Error(`Edge function error: ${error.message}`);
      }
      
      if (!data || !data.companyInfo) {
        console.error("Invalid response format:", data);
        throw new Error("Invalid response format from analysis service");
      }
      
      console.log("Company analysis completed successfully");
      return data.companyInfo as CompanyAnalysisResult;
    } catch (error) {
      console.error("Error in Company Analysis:", error);
      throw new Error(error instanceof Error 
        ? `Failed to analyze company: ${error.message}` 
        : "Failed to analyze company information. Please try again.");
    }
  }
};
