
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

/**
 * Service for deleting documents
 */
export const documentDeletionService = {
  /**
   * Delete a document by its URL or ID
   * @param document URL or ID of the document to delete
   * @returns Promise<boolean> True if the document was deleted successfully
   */
  async deleteDocument(document: string): Promise<boolean> {
    try {
      let documentId: string | null = null;
      let filePath: string | null = null;
      
      // Check if the input is a URL or an ID
      if (document.startsWith('http')) {
        // It's a URL, find the document ID and filepath from the database
        const { data, error } = await supabase
          .from('company_documents')
          .select('id, url')
          .eq('url', document)
          .single();
          
        if (error || !data) {
          console.error("Error finding document:", error);
          return false;
        }
        
        documentId = data.id;
        // Extract the filepath from the URL
        const storageUrl = supabase.storage.fromUrl(document);
        if (storageUrl) {
          filePath = storageUrl.path;
        }
      } else {
        // It's an ID, get the document details from the database
        documentId = document;
        const { data, error } = await supabase
          .from('company_documents')
          .select('url')
          .eq('id', documentId)
          .single();
          
        if (error || !data) {
          console.error("Error finding document:", error);
          return false;
        }
        
        // Extract the filepath from the URL
        const storageUrl = supabase.storage.fromUrl(data.url);
        if (storageUrl) {
          filePath = storageUrl.path;
        }
      }
      
      // If we found a filepath, delete the file from storage
      if (filePath) {
        console.log(`Deleting file: ${filePath}`);
        const { error: storageError } = await supabase.storage
          .from('value_chain_documents')
          .remove([filePath]);
          
        if (storageError) {
          console.error("Error deleting file from storage:", storageError);
          // Continue anyway to delete the database record
        }
      }
      
      // Delete the database record
      if (documentId) {
        const { error: dbError } = await supabase
          .from('company_documents')
          .delete()
          .eq('id', documentId);
          
        if (dbError) {
          console.error("Error deleting document record:", dbError);
          return false;
        }
      }
      
      console.log("Document deleted successfully");
      return true;
    } catch (error) {
      console.error("Error deleting document:", error);
      toast.error("Failed to delete document");
      return false;
    }
  }
};
