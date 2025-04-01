
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

/**
 * Service for deleting documents
 */
export const documentDeletionService = {
  /**
   * Delete a document by ID
   * 
   * @param documentId The ID of the document to delete
   * @returns Promise<boolean> indicating success
   */
  async deleteDocument(documentId: string): Promise<boolean> {
    try {
      console.log("Deleting document with ID:", documentId);
      
      // First get the document to find the storage path
      const { data: document, error: fetchError } = await supabase
        .from('company_documents')
        .select('url')
        .eq('id', documentId)
        .single();
      
      if (fetchError) {
        console.error("Error fetching document for deletion:", fetchError);
        return false;
      }
      
      if (!document) {
        console.error("Document not found");
        return false;
      }
      
      // Parse the URL to get the storage path
      try {
        const url = new URL(document.url);
        const pathParts = url.pathname.split('/');
        
        // Path should look like /storage/v1/object/public/value_chain_documents/filename.ext
        // Extract just the filename part
        const bucketName = 'value_chain_documents';
        
        // Get the filename part (should be the last part of the path)
        const fileName = pathParts[pathParts.length - 1];
        
        console.log("Deleting file from storage:", bucketName, fileName);
        
        // Delete the file from storage
        const { error: storageError } = await supabase
          .storage
          .from(bucketName)
          .remove([fileName]);
        
        if (storageError) {
          console.error("Error deleting file from storage:", storageError);
          // Continue anyway to delete the database record
        }
        
      } catch (urlError) {
        console.error("Error parsing document URL:", urlError);
        // Continue anyway to delete the database record
      }
      
      // Delete the document record
      const { error: deleteError } = await supabase
        .from('company_documents')
        .delete()
        .eq('id', documentId);
      
      if (deleteError) {
        console.error("Error deleting document record:", deleteError);
        return false;
      }
      
      console.log("Document deleted successfully");
      return true;
    } catch (error) {
      console.error("Error in deleteDocument:", error);
      return false;
    }
  }
};
