
import { supabase } from "@/lib/supabase";
import { Document } from "./types";

export const documentUploadService = {
  async uploadDocument(file: File, companyId: string, folderId: string | null = null): Promise<Document> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) {
      throw new Error('User not authenticated');
    }

    const filePath = `${companyId}/${new Date().getTime()}_${file.name}`;
    
    // Upload file to storage
    const { error: uploadError } = await supabase.storage
      .from('company_documents_storage')
      .upload(filePath, file);
      
    if (uploadError) {
      console.error('Error uploading file:', uploadError);
      throw new Error('Error uploading file');
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
      .from('documents')
      .insert({
        name: file.name,
        file_path: urlData.publicUrl,
        file_type: file.type,
        file_size: file.size,
        folder_id: folderId,
        company_id: companyId,
        created_by: user.user.id
      })
      .select()
      .single();
      
    if (error) {
      console.error('Error creating document record:', error);
      throw new Error('Error creating document record');
    }
    
    return data as Document;
  }
};
