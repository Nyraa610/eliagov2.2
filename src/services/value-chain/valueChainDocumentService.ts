
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
        const folderPrefix = companyId || user.user.id;
        const filePath = `${folderPrefix}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
        
        const { error: uploadError } = await supabase.storage
          .from('value_chain_documents')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: true
          });
          
        if (uploadError) throw uploadError;
        
        const { data: urlData } = supabase.storage
          .from('value_chain_documents')
          .getPublicUrl(filePath);
          
        return urlData.publicUrl;
      });
      
      const documentUrls = await Promise.all(uploadPromises);
      
      toast.success(`${files.length} document${files.length > 1 ? 's' : ''} uploaded successfully`);
      return documentUrls;
    } catch (error) {
      console.error("Error uploading documents:", error);
      toast.error("Failed to upload documents");
      return [];
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
