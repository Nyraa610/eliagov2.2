
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

/**
 * Service for deleting documents
 */
export const documentDeletionService = {
  /**
   * Delete a document by ID
   * @param id Document ID to delete
   * @returns True if deletion was successful
   */
  async deleteDocument(id: string): Promise<boolean> {
    try {
      // First get the document details to know which storage object to remove
      const { data: document, error: fetchError } = await supabase
        .from('company_documents')
        .select('*')
        .eq('id', id)
        .single();
        
      if (fetchError || !document) {
        console.error("Error fetching document to delete:", fetchError);
        toast.error("Could not find document to delete");
        return false;
      }
      
      // Extract the file path from the URL (remove the bucket URL prefix)
      let filePath = '';
      if (document.url) {
        // Extract the path after the bucket name in the URL
        const urlParts = document.url.split('/');
        const bucketIndex = urlParts.findIndex(part => 
          part === 'value_chain_documents' || 
          part === 'company_documents_storage'
        );
        
        if (bucketIndex !== -1 && urlParts.length > bucketIndex + 1) {
          filePath = urlParts.slice(bucketIndex + 1).join('/');
        }
      }
      
      // Delete the document from the database
      const { error: deleteError } = await supabase
        .from('company_documents')
        .delete()
        .eq('id', id);
        
      if (deleteError) {
        console.error("Error deleting document from database:", deleteError);
        toast.error("Failed to delete document from database");
        return false;
      }
      
      // If we have a file path, try to delete from storage as well
      if (filePath) {
        const bucketName = document.document_type === 'value_chain' 
          ? 'value_chain_documents' 
          : 'company_documents_storage';
          
        const { error: storageError } = await supabase.storage
          .from(bucketName)
          .remove([filePath]);
          
        if (storageError) {
          console.error("Error deleting file from storage:", storageError);
          toast.warning("Document deleted from database, but file may remain in storage");
        }
      }
      
      return true;
    } catch (error) {
      console.error("Error deleting document:", error);
      toast.error("Failed to delete document");
      return false;
    }
  }
};
