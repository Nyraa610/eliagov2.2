
import { supabase } from "@/lib/supabase";

export const documentDeletionService = {
  async deleteDocument(documentId: string): Promise<boolean> {
    try {
      // First get the document to get file path
      const { data: document, error: fetchError } = await supabase
        .from('company_documents')
        .select('*')
        .eq('id', documentId)
        .single();
        
      if (fetchError || !document) {
        console.error("Error fetching document:", fetchError);
        return false;
      }
      
      // Extract the file path from the URL
      const url = new URL(document.file_path);
      const pathParts = url.pathname.split('/');
      
      // Remove the first part which is just '/' from the pathname
      pathParts.shift();
      
      // Get the storage path - everything after the bucket name
      const bucketName = pathParts[0]; // This should be 'company_documents_storage'
      const filePath = pathParts.slice(1).join('/');
      
      // Delete the file from storage if we have a valid path
      if (bucketName && filePath) {
        const { error: storageError } = await supabase.storage
          .from('company_documents_storage')
          .remove([filePath]);
          
        if (storageError) {
          console.error("Error removing from storage:", storageError);
          // Continue with deletion from database even if storage deletion fails
        }
      }
      
      // Delete the document record from the database
      const { error: deleteError } = await supabase
        .from('company_documents')
        .delete()
        .eq('id', documentId);
        
      if (deleteError) {
        console.error("Error deleting document:", deleteError);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error("Exception deleting document:", error);
      return false;
    }
  },
  
  async deleteFolder(folderId: string): Promise<boolean> {
    try {
      // Delete the folder
      const { error } = await supabase
        .from('document_folders')
        .delete()
        .eq('id', folderId);
        
      if (error) {
        console.error("Error deleting folder:", error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error("Exception deleting folder:", error);
      return false;
    }
  }
};
