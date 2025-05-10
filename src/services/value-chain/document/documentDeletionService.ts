
import { supabase } from "@/lib/supabase";
import { documentBaseService } from "./documentBaseService";

/**
 * Service for deleting documents
 */
export const documentDeletionService = {
  /**
   * Delete a document from the database and storage
   * @param documentId The ID of the document to delete
   * @returns Promise<boolean> True if document was deleted successfully
   */
  async deleteDocument(documentId: string): Promise<boolean> {
    try {
      // First get the document details to find the file path
      const { data: document, error: docError } = await supabase
        .from('company_documents')
        .select('*')
        .eq('id', documentId)
        .single();
        
      if (docError || !document) {
        console.error("Error retrieving document for deletion:", docError);
        return false;
      }
      
      // Get the company ID (or user's ID if it's a personal document)
      const ownerId = document.company_id;
      
      if (!ownerId) {
        console.error("Invalid document record, missing owner ID");
        return false;
      }
      
      // Extract the file path from the URL
      const url = document.url;
      const urlParts = url.split('value_chain_documents/');
      
      // Only proceed if we successfully parsed the file path
      if (urlParts.length < 2) {
        console.error("Could not determine file path from URL:", url);
        return false;
      }
      
      // The path is everything after the bucket name
      const filePath = decodeURIComponent(urlParts[1].split('?')[0]);
      
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('value_chain_documents')
        .remove([filePath]);
        
      if (storageError) {
        console.error("Error removing file from storage:", storageError);
        // Continue to try to delete from database even if storage deletion fails
      }
      
      // Delete from database
      const { error: dbError } = await supabase
        .from('company_documents')
        .delete()
        .eq('id', documentId);
        
      if (dbError) {
        console.error("Error deleting document from database:", dbError);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error("Error in deleteDocument:", error);
      return false;
    }
  }
};
