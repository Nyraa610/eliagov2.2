import { supabase } from "@/lib/supabase";
import { Document, DocumentFolder } from "./types";

// Mock data storage keys
const DOCUMENTS_STORAGE_KEY = "documents";
const FOLDERS_STORAGE_KEY = "folders";

export const documentRetrievalService = {
  getDocuments: async (
    companyId: string,
    folderId?: string | null
  ): Promise<Document[]> => {
    try {
      // First try to get from Supabase
      let query = supabase.from("documents").select("*").eq("company_id", companyId);
      
      if (folderId) {
        query = query.eq("folder_id", folderId);
      } else {
        query = query.is("folder_id", null);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      if (data) {
        return data as Document[];
      }
    } catch (error) {
      console.error("Error fetching documents:", error);
    }
    
    // Fallback to localStorage if Supabase fails
    const documents = JSON.parse(localStorage.getItem(DOCUMENTS_STORAGE_KEY) || "[]");
    return documents.filter((doc: Document) => {
      if (doc.company_id !== companyId) return false;
      if (folderId) {
        return doc.folder_id === folderId;
      }
      return !doc.folder_id;
    });
  },
  
  getPersonalDocuments: async (userId: string): Promise<Document[]> => {
    try {
      // First try to get from Supabase
      const { data, error } = await supabase
        .from("personal_documents")
        .select("*")
        .eq("user_id", userId);
      
      if (error) throw error;
      
      if (data) {
        return data as Document[];
      }
    } catch (error) {
      console.error("Error fetching personal documents:", error);
    }
    
    // Fallback to localStorage if Supabase fails
    const documents = JSON.parse(localStorage.getItem("personal_documents") || "[]");
    return documents.filter((doc: Document) => doc.user_id === userId);
  },
  
  getFolders: async (
    companyId: string,
    parentId?: string | null
  ): Promise<DocumentFolder[]> => {
    try {
      // First try to get from Supabase
      let query = supabase.from("document_folders").select("*").eq("company_id", companyId);
      
      if (parentId) {
        query = query.eq("parent_id", parentId);
      } else {
        query = query.is("parent_id", null);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      if (data) {
        return data as DocumentFolder[];
      }
    } catch (error) {
      console.error("Error fetching folders:", error);
    }
    
    // Fallback to localStorage if Supabase fails
    const folders = JSON.parse(localStorage.getItem(FOLDERS_STORAGE_KEY) || "[]");
    return folders.filter((folder: DocumentFolder) => {
      if (folder.company_id !== companyId) return false;
      if (parentId) {
        return folder.parent_id === parentId;
      }
      return !folder.parent_id;
    });
  },
  
  getFolder: async (folderId: string): Promise<DocumentFolder | null> => {
    try {
      // First try to get from Supabase
      const { data, error } = await supabase
        .from("document_folders")
        .select("*")
        .eq("id", folderId)
        .single();
      
      if (error) throw error;
      
      if (data) {
        return data as DocumentFolder;
      }
    } catch (error) {
      console.error("Error fetching folder:", error);
    }
    
    // Fallback to localStorage if Supabase fails
    const folders = JSON.parse(localStorage.getItem(FOLDERS_STORAGE_KEY) || "[]");
    const folder = folders.find((f: DocumentFolder) => f.id === folderId);
    return folder || null;
  }
};
