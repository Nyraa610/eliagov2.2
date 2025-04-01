
import { supabase } from "@/lib/supabase";
import { documentBaseService } from "./documentBaseService";

/**
 * Service for retrieving documents
 */
export const documentRetrievalService = {
  /**
   * Get documents for a specific company
   * @param companyId Company ID to get documents for (optional, will use current user's company if not provided)
   * @returns Array of document objects
   */
  async getDocuments(companyId?: string) {
    try {
      // Get the user's company ID if not provided
      const userCompanyId = await documentBaseService.getUserCompanyId(companyId);
      
      if (!userCompanyId) {
        console.error("Company ID is required to retrieve documents");
        return [];
      }

      console.log("Fetching documents for company ID:", userCompanyId);
      
      // Ensure the bucket exists before trying to fetch documents
      const bucketExists = await documentBaseService.ensureDocumentBucketExists();
      if (!bucketExists) {
        console.error("Document bucket does not exist");
        return [];
      }

      const { data, error } = await supabase
        .from('company_documents')
        .select('*')
        .eq('company_id', userCompanyId)
        .eq('document_type', 'value_chain')
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error retrieving documents:", error);
        throw error;
      }
      
      console.log("Retrieved documents:", data);
      return data || [];
    } catch (error) {
      console.error("Error in getDocuments:", error);
      return [];
    }
  }
};
