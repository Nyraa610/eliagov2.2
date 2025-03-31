
import { supabase } from "@/lib/supabase";

export const documentDeletionService = {
  async deleteDocument(documentId: string): Promise<void> {
    // Get the document to find the file path
    const { data: document, error: fetchError } = await supabase
      .from('documents')
      .select('file_path')
      .eq('id', documentId)
      .single();
      
    if (fetchError) {
      console.error('Error fetching document:', fetchError);
      throw new Error('Error fetching document');
    }
    
    // Extract the path from the URL
    const filePath = document.file_path.split('/').pop();
    
    // Delete the file from storage
    const { error: storageError } = await supabase.storage
      .from('company_documents_storage')
      .remove([filePath]);
      
    if (storageError) {
      console.error('Error removing file from storage:', storageError);
      // Continue anyway to delete the database record
    }
    
    // Delete the document record
    const { error: deleteError } = await supabase
      .from('documents')
      .delete()
      .eq('id', documentId);
      
    if (deleteError) {
      console.error('Error deleting document record:', deleteError);
      throw new Error('Error deleting document record');
    }
  },
  
  async deleteFolder(folderId: string): Promise<void> {
    // Recursively delete subfolders
    const { data: subfolders } = await supabase
      .from('document_folders')
      .select('id')
      .eq('parent_id', folderId);
      
    if (subfolders && subfolders.length > 0) {
      for (const subfolder of subfolders) {
        await this.deleteFolder(subfolder.id);
      }
    }
    
    // Delete documents in this folder
    const { data: documents } = await supabase
      .from('documents')
      .select('id')
      .eq('folder_id', folderId);
      
    if (documents && documents.length > 0) {
      for (const document of documents) {
        await this.deleteDocument(document.id);
      }
    }
    
    // Finally, delete the folder itself
    const { error } = await supabase
      .from('document_folders')
      .delete()
      .eq('id', folderId);
      
    if (error) {
      console.error('Error deleting folder:', error);
      throw new Error('Error deleting folder');
    }
  }
};
