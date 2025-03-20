
import { supabase } from "@/lib/supabase";
import { documentBaseService } from "./documentBaseService";

/**
 * Service for retrieving documents
 */
export const documentRetrievalService = {
  /**
   * Get all documents for the current user or specified company
   * @param companyId Optional company ID to get documents for
   * @returns Array of document objects with URLs and names
   */
  async getDocuments(companyId?: string): Promise<{ url: string; name: string; id: string }[]> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        return [];
      }
      
      // Get user's company if not provided
      const userCompanyId = await documentBaseService.getUserCompanyId(companyId);
      if (!userCompanyId) {
        return [];
      }
      
      // Get documents from the database
      const { data, error } = await supabase
        .from('company_documents')
        .select('*')
        .eq('company_id', userCompanyId)
        .eq('document_type', 'value_chain');
        
      if (error) {
        console.error("Error fetching documents:", error);
        return [];
      }
      
      // Format the response
      return data.map(doc => ({
        url: doc.url,
        name: doc.name,
        id: doc.id
      }));
    } catch (error) {
      console.error("Error getting documents:", error);
      return [];
    }
  }
};
