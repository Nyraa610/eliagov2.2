
import { supabase } from "@/lib/supabase";

/**
 * Service for retrieving documents
 */
export const documentRetrievalService = {
  /**
   * Get documents for a specific company or user
   * @param companyId Company or user ID to get documents for
   * @returns Array of document objects
   */
  async getDocuments(companyId?: string) {
    try {
      if (!companyId) {
        throw new Error("Company ID is required to retrieve documents");
      }

      const { data, error } = await supabase
        .from('company_documents')
        .select('*')
        .eq('company_id', companyId)
        .eq('document_type', 'value_chain')
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error retrieving documents:", error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error("Error in getDocuments:", error);
      return [];
    }
  }
};
