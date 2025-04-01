
import { supabase } from "@/lib/supabase";
import { Document } from "./types";
import { toast } from "sonner";

export const documentUploadService = {
  async ensureStorageBucketExists() {
    try {
      // Check if the bucket exists
      const { data: buckets, error: listError } = await supabase.storage.listBuckets();
      
      if (listError) {
        console.error('Error listing buckets:', listError);
        throw new Error('Failed to check storage buckets');
      }
      
      const bucketExists = buckets.some(bucket => bucket.name === 'company_documents_storage');
      
      if (!bucketExists) {
        // Create the bucket if it doesn't exist
        const { error: createError } = await supabase.storage.createBucket('company_documents_storage', {
          public: true
        });
        
        if (createError) {
          console.error('Error creating bucket:', createError);
          throw new Error('Failed to create storage bucket');
        }
        
        console.log('Created company_documents_storage bucket successfully');
      } else {
        console.log('company_documents_storage bucket already exists');
      }
      
      return true;
    } catch (error) {
      console.error('Error ensuring bucket exists:', error);
      return false;
    }
  },

  async ensureCompanyFolder(companyId: string) {
    try {
      // Create a placeholder file to establish folder structure
      const folderPath = `${companyId}/.folder`;
      
      await this.ensureStorageBucketExists();
      
      const { error } = await supabase.storage
        .from('company_documents_storage')
        .upload(folderPath, new Uint8Array(0), {
          contentType: 'application/x-directory',
          upsert: true
        });
        
      if (error) {
        console.error('Error creating company folder:', error);
        return false;
      }
      
      console.log(`Company folder for ID ${companyId} initialized`);
      return true;
    } catch (error) {
      console.error('Error initializing company folder:', error);
      return false;
    }
  },

  async uploadDocument(file: File, companyId: string, folderId: string | null = null): Promise<Document> {
    try {
      // Ensure the user is authenticated
      const { data: authData, error: authError } = await supabase.auth.getUser();
      
      if (authError || !authData.user) {
        console.error('Authentication error:', authError);
        throw new Error('User not authenticated');
      }

      // Ensure the storage bucket exists
      await this.ensureCompanyFolder(companyId);

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
  },

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
      await this.ensureStorageBucketExists();

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
