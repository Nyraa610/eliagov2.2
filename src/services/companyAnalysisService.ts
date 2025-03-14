
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
      const { data, error } = await supabase.functions.invoke('company-analysis', {
        body: { companyName }
      });
      
      if (error) throw error;
      
      return data.companyInfo as CompanyAnalysisResult;
    } catch (error) {
      console.error("Error in Company Analysis:", error);
      throw new Error("Failed to analyze company information. Please try again.");
    }
  }
};
