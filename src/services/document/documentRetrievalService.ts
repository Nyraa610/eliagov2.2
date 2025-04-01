
import { supabase } from "@/lib/supabase";
import { Document, DocumentFolder, Deliverable } from "./types";

export const documentRetrievalService = {
  async getDocuments(companyId: string, folderId: string | null = null): Promise<Document[]> {
    let query = supabase
      .from('company_documents')
      .select('*')
      .eq('company_id', companyId)
      .eq('document_type', 'standard');
      
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

  async getPersonalDocuments(userId: string): Promise<Document[]> {
    const { data, error } = await supabase
      .from('company_documents')
      .select('*')
      .eq('uploaded_by', userId)
      .eq('document_type', 'personal')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching personal documents:', error);
      throw new Error('Error fetching personal documents');
    }
    
    return data as Document[];
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
  
  async getDeliverables(companyId: string): Promise<Deliverable[]> {
    const { data, error } = await supabase
      .from('company_documents')
      .select('*')
      .eq('company_id', companyId)
      .eq('document_type', 'deliverable')
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error('Error fetching deliverables:', error);
      throw new Error('Error fetching deliverables');
    }
    
    return data as Deliverable[];
  }
};
