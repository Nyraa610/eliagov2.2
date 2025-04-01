
import { supabase } from "@/lib/supabase";
import { Document } from "../types";
import { toast } from "sonner";
import { storageBucketService } from "../storage/storageBucketService";
import { folderService } from "../storage/folderService";

/**
 * Service for handling company document uploads
 */
export const companyDocumentService = {
  /**
   * Upload a company document
   * @param file File to upload
   * @param companyId Company ID for which the document belongs
   * @param folderId Optional folder ID
   * @returns Promise<Document> The uploaded document information
   */
  async uploadDocument(file: File, companyId: string, folderId: string | null = null): Promise<Document> {
    try {
      // Ensure the user is authenticated
      const { data: authData, error: authError } = await supabase.auth.getUser();
      
      if (authError || !authData.user) {
        console.error('Authentication error:', authError);
        throw new Error('User not authenticated');
      }

      // Ensure the storage bucket exists
      await folderService.ensureCompanyFolder(companyId);

      // Create a secure file path with sanitized filename
      const filePath = `${companyId}/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      console.log(`Uploading file to path: ${filePath}`);
      
      // Upload file to storage
      const { error: uploadError } = await supabase.storage
        .from('company_documents_storage')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });
        
      if (uploadError) {
        console.error('Error uploading file:', uploadError);
        throw new Error(`Error uploading file: ${uploadError.message}`);
      }
      
      // Get file URL
      const { data: urlData } = supabase.storage
        .from('company_documents_storage')
        .getPublicUrl(filePath);
        
      if (!urlData) {
        throw new Error('Failed to get file URL');
      }
      
      console.log(`File uploaded successfully, URL: ${urlData.publicUrl}`);
      
      // Create document record in database with the authenticated user ID
      const { data, error } = await supabase
        .from('company_documents')
        .insert({
          name: file.name,
          url: urlData.publicUrl,
          file_type: file.type,
          file_size: file.size,
          folder_id: folderId,
          company_id: companyId,
          uploaded_by: authData.user.id,
          document_type: 'standard',
        })
        .select()
        .single();
        
      if (error) {
        console.error('Error creating document record:', error);
        throw new Error(`Error creating document record: ${error.message}`);
      }
      
      toast.success(`Document ${file.name} uploaded successfully`);
      return data as Document;
    } catch (error) {
      console.error('Upload document error:', error);
      toast.error(`Upload failed: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }
};
