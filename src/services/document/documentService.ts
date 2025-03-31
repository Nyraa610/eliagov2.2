
import { supabase } from "@/lib/supabase";

export interface Document {
  id: string;
  name: string;
  file_path: string;
  file_type: string;
  file_size: number;
  folder_id: string | null;
  company_id: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface DocumentFolder {
  id: string;
  name: string;
  company_id: string;
  parent_id: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface Deliverable {
  id: string;
  name: string;
  description: string | null;
  file_path: string;
  document_type: string;
  company_id: string;
  created_at: string;
  updated_at: string;
}

export const documentService = {
  // Document methods
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
  },
  
  async getDocuments(companyId: string, folderId: string | null = null): Promise<Document[]> {
    let query = supabase
      .from('documents')
      .select('*')
      .eq('company_id', companyId);
      
    if (folderId) {
      query = query.eq('folder_id', folderId);
    } else {
      query = query.is('folder_id', null);
    }
    
    const { data, error } = await query.order('name');
    
    if (error) {
      console.error('Error fetching documents:', error);
      throw new Error('Error fetching documents');
    }
    
    return data as Document[];
  },
  
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
  
  // Folder methods
  async createFolder(name: string, companyId: string, parentId: string | null = null): Promise<DocumentFolder> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) {
      throw new Error('User not authenticated');
    }
    
    const { data, error } = await supabase
      .from('document_folders')
      .insert({
        name,
        company_id: companyId,
        parent_id: parentId,
        created_by: user.user.id
      })
      .select()
      .single();
      
    if (error) {
      console.error('Error creating folder:', error);
      throw new Error('Error creating folder');
    }
    
    return data as DocumentFolder;
  },
  
  async getFolders(companyId: string, parentId: string | null = null): Promise<DocumentFolder[]> {
    let query = supabase
      .from('document_folders')
      .select('*')
      .eq('company_id', companyId);
      
    if (parentId) {
      query = query.eq('parent_id', parentId);
    } else {
      query = query.is('parent_id', null);
    }
    
    const { data, error } = await query.order('name');
    
    if (error) {
      console.error('Error fetching folders:', error);
      throw new Error('Error fetching folders');
    }
    
    return data as DocumentFolder[];
  },
  
  async getFolder(folderId: string): Promise<DocumentFolder> {
    const { data, error } = await supabase
      .from('document_folders')
      .select('*')
      .eq('id', folderId)
      .single();
      
    if (error) {
      console.error('Error fetching folder:', error);
      throw new Error('Error fetching folder');
    }
    
    return data as DocumentFolder;
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
  },
  
  // Deliverables methods
  async getDeliverables(companyId: string): Promise<Deliverable[]> {
    const { data, error } = await supabase
      .from('document_deliverables')
      .select('*')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error('Error fetching deliverables:', error);
      throw new Error('Error fetching deliverables');
    }
    
    return data as Deliverable[];
  }
};
