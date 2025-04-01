
import { supabase } from "@/lib/supabase";
import { Document } from "./types";

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
      }
      
      return true;
    } catch (error) {
      console.error('Error ensuring bucket exists:', error);
      return false;
    }
  },

  async uploadDocument(file: File, companyId: string, folderId: string | null = null): Promise<Document> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) {
      throw new Error('User not authenticated');
    }

    // Ensure the storage bucket exists
    await this.ensureStorageBucketExists();

    const filePath = `${companyId}/${new Date().getTime()}_${file.name}`;
    
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
    
    // Create document record in database
    const { data, error } = await supabase
      .from('company_documents')
      .insert({
        name: file.name,
        file_path: urlData.publicUrl,
        file_type: file.type,
        file_size: file.size,
        folder_id: folderId,
        company_id: companyId,
        uploaded_by: user.user.id,
        document_type: 'standard',
        is_personal: false
      })
      .select()
      .single();
      
    if (error) {
      console.error('Error creating document record:', error);
      throw new Error(`Error creating document record: ${error.message}`);
    }
    
    return data as Document;
  },

  async uploadPersonalDocument(file: File, userId: string): Promise<Document> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) {
      throw new Error('User not authenticated');
    }

    // Ensure the storage bucket exists
    await this.ensureStorageBucketExists();

    const filePath = `personal/${userId}/${new Date().getTime()}_${file.name}`;
    
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
    
    // Create document record in database
    const { data, error } = await supabase
      .from('company_documents')
      .insert({
        name: file.name,
        file_path: urlData.publicUrl,
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
    
    return data as Document;
  }
};
