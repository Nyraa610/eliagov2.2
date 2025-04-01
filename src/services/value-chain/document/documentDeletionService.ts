
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
        filePath = extractPathFromUrl(data.url);
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
        filePath = extractPathFromUrl(data.url);
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

/**
 * Helper function to extract the file path from a Supabase Storage URL
 * @param url The full Supabase storage URL
 * @returns The file path relative to the bucket or null if path couldn't be extracted
 */
function extractPathFromUrl(url: string): string | null {
  try {
    if (!url) return null;
    
    // Parse the URL
    const parsedUrl = new URL(url);
    
    // Extract the path from the URL
    const pathParts = parsedUrl.pathname.split('/');
    
    // Remove empty parts (like the first slash)
    const filteredParts = pathParts.filter(part => part !== '');
    
    // The first part should be the bucket name
    if (filteredParts.length < 2) return null;
    
    // Skip the bucket name and 'object' part if they exist in the path
    // and return the rest as the file path
    let startIndex = 1; // Start after the bucket name
    
    // If the path contains 'object' as the second part, skip it
    if (filteredParts[1] === 'object') {
      startIndex = 2;
    }
    
    // Join the remaining parts to form the filepath
    const filePath = filteredParts.slice(startIndex).join('/');
    
    console.log('Extracted file path:', filePath);
    return filePath;
  } catch (error) {
    console.error('Error extracting path from URL:', error);
    return null;
  }
}
