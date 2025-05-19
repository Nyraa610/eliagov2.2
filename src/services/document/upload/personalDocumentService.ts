
import { supabase } from "@/lib/supabase";
import { Document } from "../types";
import { toast } from "sonner";
import { storageBucketService } from "../storage/storageBucketService";

/**
 * Service for handling personal document uploads
 */
export const personalDocumentService = {
  /**
   * Upload a personal document
   * @param file File to upload
   * @param userId User ID for the document owner
   * @returns Promise<Document> The uploaded document information
   */
  async uploadPersonalDocument(file: File, userId: string): Promise<Document> {
    try {
      // Ensure the user is authenticated
      const { data: authData, error: authError } = await supabase.auth.getUser();
      
      if (authError || !authData.user) {
        console.error('Authentication error:', authError);
        throw new Error('User not authenticated');
      }

      // Verify the authenticated user matches the requested userId
      if (authData.user.id !== userId) {
        console.error('User ID mismatch');
        throw new Error('Not authorized to upload for this user');
      }

      // Ensure the storage bucket exists
      await storageBucketService.ensureStorageBucketExists();

      // Create a secure file path with sanitized filename
      const filePath = `personal/${userId}/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      console.log(`Uploading personal file to path: ${filePath}`);
      
      // Upload file to storage
      const { error: uploadError } = await supabase.storage
        .from('company_documents_storage')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });
        
      if (uploadError) {
        console.error('Error uploading personal file:', uploadError);
        throw new Error(`Error uploading file: ${uploadError.message}`);
      }
      
      // Get file URL
      const { data: urlData } = supabase.storage
        .from('company_documents_storage')
        .getPublicUrl(filePath);
        
      if (!urlData) {
        throw new Error('Failed to get file URL');
      }
      
      console.log(`Personal file uploaded successfully, URL: ${urlData.publicUrl}`);
      
      // Create document record in database with the authenticated user ID
      const { data, error } = await supabase
        .from('company_documents')
        .insert({
          name: file.name,
          url: urlData.publicUrl,
          file_type: file.type,
          file_size: file.size,
          uploaded_by: userId,
          document_type: 'personal',
          is_personal: true
        })
        .select()
        .single();
        
      if (error) {
        console.error('Error creating personal document record:', error);
        throw new Error(`Error creating personal document record: ${error.message}`);
      }
      
      toast.success(`Document ${file.name} uploaded successfully`);
      return data as Document;
    } catch (error) {
      console.error('Upload personal document error:', error);
      toast.error(`Upload failed: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }
};
