
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export const valueChainDocumentService = {
  /**
   * Upload documents for the value chain analysis
   * @param files Files to upload
   * @param companyId Company ID for which these documents belong
   * @returns Array of URLs for the uploaded documents
   */
  async uploadDocuments(files: File[], companyId?: string): Promise<string[]> {
    try {
      if (!files.length) return [];
      
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        throw new Error("Authentication required to upload documents");
      }
      
      // Get user's company if not provided
      let userCompanyId = companyId;
      if (!userCompanyId) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('company_id')
          .eq('id', user.user.id)
          .single();
          
        userCompanyId = profile?.company_id;
        
        if (!userCompanyId) {
          throw new Error("User is not associated with a company");
        }
      }
      
      // Ensure the value_chain_documents bucket exists
      const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
      if (bucketsError) throw bucketsError;
      
      const bucketExists = buckets?.some(b => b.name === 'value_chain_documents');
      if (!bucketExists) {
        const { error: createBucketError } = await supabase.storage.createBucket('value_chain_documents', {
          public: true
        });
        if (createBucketError) throw createBucketError;
      }
      
      // Upload each file
      const uploadPromises = files.map(async (file) => {
        const folderPrefix = userCompanyId;
        const filePath = `${folderPrefix}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
        
        console.log(`Uploading file ${file.name} to ${filePath}`);
        
        const { error: uploadError, data: uploadData } = await supabase.storage
          .from('value_chain_documents')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: true
          });
          
        if (uploadError) {
          console.error(`Error uploading file ${file.name}:`, uploadError);
          throw uploadError;
        }
        
        const { data: urlData } = supabase.storage
          .from('value_chain_documents')
          .getPublicUrl(filePath);
          
        console.log(`Successfully uploaded file ${file.name}, URL: ${urlData.publicUrl}`);
        
        // Save document metadata to the database
        await supabase.from('company_documents').insert({
          company_id: userCompanyId,
          name: file.name,
          file_type: file.type,
          file_size: file.size,
          url: urlData.publicUrl,
          uploaded_by: user.user.id,
          document_type: 'value_chain'
        });
        
        return urlData.publicUrl;
      });
      
      const documentUrls = await Promise.all(uploadPromises);
      
      return documentUrls;
    } catch (error) {
      console.error("Error uploading documents:", error);
      toast.error("Failed to upload documents");
      return [];
    }
  },
  
  /**
   * Get all documents for the current user or specified company
   * @param companyId Optional company ID to get documents for
   * @returns Array of document objects with URLs and names
   */
  async getDocuments(companyId?: string): Promise<{ url: string; name: string }[]> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        throw new Error("Authentication required to access documents");
      }
      
      // Get user's company if not provided
      let userCompanyId = companyId;
      if (!userCompanyId) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('company_id')
          .eq('id', user.user.id)
          .single();
          
        userCompanyId = profile?.company_id;
        
        if (!userCompanyId) {
          return [];
        }
      }
      
      // Get documents from the database instead of storage
      const { data, error } = await supabase
        .from('company_documents')
        .select('*')
        .eq('company_id', userCompanyId)
        .eq('document_type', 'value_chain');
        
      if (error) {
        throw error;
      }
      
      if (!data || data.length === 0) {
        return [];
      }
      
      // Format the response to match the expected interface
      const documents = data.map(doc => ({
        url: doc.url,
        name: doc.name,
        id: doc.id
      }));
      
      return documents;
    } catch (error) {
      console.error("Error getting documents:", error);
      return [];
    }
  },
  
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
      
      // The file path is everything after the bucket name
      const bucketPath = pathSegments.slice(1);
      const bucketName = bucketPath[0]; // Should be value_chain_documents
      const filePath = bucketPath.slice(1).join('/');
      
      if (bucketName !== 'value_chain_documents') {
        throw new Error("Invalid document URL");
      }
      
      // Remove the file from storage
      const { error: storageError } = await supabase.storage
        .from('value_chain_documents')
        .remove([filePath]);
        
      if (storageError) {
        console.error("Error removing from storage:", storageError);
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
  },
  
  /**
   * Process documents to extract text and context for AI analysis
   * This is a placeholder for future implementation
   */
  async processDocuments(documentUrls: string[]): Promise<string> {
    // This would ideally extract text from PDFs, analyze images, etc.
    // For now, we'll just return the URLs as context
    return `Supporting documents provided: ${documentUrls.join(', ')}`;
  }
};
