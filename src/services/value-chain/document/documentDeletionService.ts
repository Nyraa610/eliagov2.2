
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

/**
 * Service for deleting documents
 */
export const documentDeletionService = {
  /**
   * Delete a document by its URL
   * @param url URL of the document to delete
   * @returns Boolean indicating success
   */
  async deleteDocument(url: string): Promise<boolean> {
    try {
      // Find the document in the database
      const { data: document, error: findError } = await supabase
        .from('company_documents')
        .select('*')
        .eq('url', url)
        .single();
        
      if (findError || !document) {
        throw new Error("Document not found");
      }
      
      // Extract the path from the URL
      const urlObj = new URL(url);
      const pathSegments = urlObj.pathname.split('/');
      
      // The file path is everything after the bucket name in the URL path
      const bucketPath = pathSegments.slice(1);
      const bucketName = bucketPath[0]; // Should be value_chain_documents
      const filePath = bucketPath.slice(1).join('/');
      
      // Remove the file from storage
      if (bucketName === 'value_chain_documents') {
        const { error: storageError } = await supabase.storage
          .from('value_chain_documents')
          .remove([filePath]);
          
        if (storageError) {
          console.error("Error removing from storage:", storageError);
        }
      }
      
      // Remove the document from the database
      const { error: dbError } = await supabase
        .from('company_documents')
        .delete()
        .eq('id', document.id);
        
      if (dbError) {
        throw dbError;
      }
      
      return true;
    } catch (error) {
      console.error("Error deleting document:", error);
      toast.error("Failed to delete document");
      return false;
    }
  }
};
