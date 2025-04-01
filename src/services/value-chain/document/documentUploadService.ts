
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { documentBaseService } from "./documentBaseService";

/**
 * Service for uploading documents
 */
export const documentUploadService = {
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
      const userCompanyId = await documentBaseService.getUserCompanyId(companyId);
      if (!userCompanyId) {
        throw new Error("User is not associated with a company");
      }
      
      // Ensure the bucket exists
      const bucketExists = await documentBaseService.ensureDocumentBucketExists();
      if (!bucketExists) {
        throw new Error("Failed to access storage. Please try again later.");
      }
      
      // Upload each file
      const uploadPromises = files.map(async (file) => {
        try {
          const folderPrefix = userCompanyId;
          const filePath = `${folderPrefix}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
          
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
            
          // Save document metadata to the database
          const { error: insertError } = await supabase.from('company_documents').insert({
            company_id: userCompanyId,
            name: file.name,
            file_type: file.type,
            file_size: file.size,
            url: urlData.publicUrl,
            uploaded_by: user.user.id,
            document_type: 'value_chain'
          });
          
          if (insertError) {
            console.error("Error saving document metadata:", insertError);
            throw insertError;
          }
          
          // Return the public URL for the file
          return urlData.publicUrl;
        } catch (error) {
          console.error(`Error processing file ${file.name}:`, error);
          toast.error(`Failed to upload ${file.name}`);
          return null;
        }
      });
      
      const results = await Promise.all(uploadPromises);
      const documentUrls = results.filter(url => url !== null) as string[];
      
      if (documentUrls.length === 0 && files.length > 0) {
        toast.error("Failed to upload any documents");
      } else if (documentUrls.length < files.length) {
        toast.warning(`Uploaded ${documentUrls.length} of ${files.length} documents`);
      } else {
        toast.success(`Uploaded ${documentUrls.length} document(s) successfully`);
      }
      
      return documentUrls;
    } catch (error) {
      console.error("Error uploading documents:", error);
      toast.error("Failed to upload documents");
      return [];
    }
  }
};
