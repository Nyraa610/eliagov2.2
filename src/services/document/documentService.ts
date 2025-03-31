
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export type Document = {
  id: string;
  name: string;
  file_path: string;
  file_type: string;
  file_size: number;
  folder_path: string;
  company_id: string;
  created_by: string;
  created_at: string;
  updated_at: string;
};

export type DocumentFolder = {
  id: string;
  name: string;
  company_id: string;
  parent_id: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
};

export type Deliverable = {
  id: string;
  name: string;
  description: string | null;
  file_path: string;
  document_type: string;
  company_id: string;
  created_at: string;
  updated_at: string;
};

export const documentService = {
  // Document operations
  async uploadDocument(
    file: File,
    folderId: string | null = null,
    companyId: string
  ): Promise<Document | null> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        toast.error("Authentication required");
        return null;
      }

      const folderInfo = folderId ? await this.getFolder(folderId) : null;
      const folderPath = folderInfo ? folderInfo.name : "";
      
      // Create path in storage
      const timestamp = new Date().getTime();
      const safeFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const filePath = `${companyId}/${folderPath ? folderPath + '/' : ''}${timestamp}-${safeFileName}`;
      
      // Upload file to storage
      const { error: uploadError } = await supabase.storage
        .from('company_documents_storage')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });
      
      if (uploadError) {
        console.error("Upload error:", uploadError);
        toast.error(`Failed to upload: ${uploadError.message}`);
        return null;
      }
      
      // Get the URL of the uploaded file
      const { data: urlData } = supabase.storage
        .from('company_documents_storage')
        .getPublicUrl(filePath);
      
      if (!urlData) {
        toast.error("Failed to get file URL");
        return null;
      }
      
      // Create document record in database
      const document = {
        name: file.name,
        file_path: urlData.publicUrl,
        file_type: file.type,
        file_size: file.size,
        folder_path: folderPath,
        company_id: companyId,
        created_by: user.user.id
      };
      
      const { data, error } = await supabase
        .from('documents')
        .insert(document)
        .select('*')
        .single();
      
      if (error) {
        console.error("Document record error:", error);
        toast.error(`Failed to save document metadata: ${error.message}`);
        return null;
      }
      
      toast.success(`Document "${file.name}" uploaded successfully`);
      return data;
    } catch (error) {
      console.error("Upload document error:", error);
      toast.error("Failed to upload document");
      return null;
    }
  },
  
  async getDocuments(companyId: string, folderId: string | null = null): Promise<Document[]> {
    try {
      let query = supabase
        .from('documents')
        .select('*')
        .eq('company_id', companyId);
      
      if (folderId) {
        const folder = await this.getFolder(folderId);
        if (folder) {
          query = query.eq('folder_path', folder.name);
        }
      } else {
        query = query.eq('folder_path', '');
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) {
        console.error("Get documents error:", error);
        toast.error("Failed to load documents");
        return [];
      }
      
      return data || [];
    } catch (error) {
      console.error("Get documents error:", error);
      toast.error("Failed to load documents");
      return [];
    }
  },
  
  async deleteDocument(id: string): Promise<boolean> {
    try {
      const { data: document, error: fetchError } = await supabase
        .from('documents')
        .select('file_path')
        .eq('id', id)
        .single();
      
      if (fetchError || !document) {
        console.error("Fetch document error:", fetchError);
        toast.error("Document not found");
        return false;
      }
      
      // Extract path from URL
      const url = new URL(document.file_path);
      const pathSegments = url.pathname.split('/');
      const storageFilePath = pathSegments.slice(pathSegments.findIndex(s => s === 'company_documents_storage') + 1).join('/');
      
      // Delete file from storage
      const { error: storageError } = await supabase.storage
        .from('company_documents_storage')
        .remove([storageFilePath]);
      
      if (storageError) {
        console.error("Delete storage error:", storageError);
        // Continue with database deletion even if storage deletion fails
      }
      
      // Delete document record from database
      const { error: deleteError } = await supabase
        .from('documents')
        .delete()
        .eq('id', id);
      
      if (deleteError) {
        console.error("Delete document error:", deleteError);
        toast.error("Failed to delete document record");
        return false;
      }
      
      toast.success("Document deleted successfully");
      return true;
    } catch (error) {
      console.error("Delete document error:", error);
      toast.error("Failed to delete document");
      return false;
    }
  },
  
  // Folder operations
  async createFolder(name: string, companyId: string, parentId: string | null = null): Promise<DocumentFolder | null> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        toast.error("Authentication required");
        return null;
      }
      
      const folder = {
        name,
        company_id: companyId,
        parent_id: parentId,
        created_by: user.user.id
      };
      
      const { data, error } = await supabase
        .from('document_folders')
        .insert(folder)
        .select('*')
        .single();
      
      if (error) {
        console.error("Create folder error:", error);
        toast.error("Failed to create folder");
        return null;
      }
      
      toast.success(`Folder "${name}" created successfully`);
      return data;
    } catch (error) {
      console.error("Create folder error:", error);
      toast.error("Failed to create folder");
      return null;
    }
  },
  
  async getFolders(companyId: string, parentId: string | null = null): Promise<DocumentFolder[]> {
    try {
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
        console.error("Get folders error:", error);
        toast.error("Failed to load folders");
        return [];
      }
      
      return data || [];
    } catch (error) {
      console.error("Get folders error:", error);
      toast.error("Failed to load folders");
      return [];
    }
  },
  
  async getFolder(id: string): Promise<DocumentFolder | null> {
    try {
      const { data, error } = await supabase
        .from('document_folders')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        console.error("Get folder error:", error);
        return null;
      }
      
      return data;
    } catch (error) {
      console.error("Get folder error:", error);
      return null;
    }
  },
  
  async deleteFolder(id: string): Promise<boolean> {
    try {
      // Check for subfolders
      const { data: subfolders, error: subfoldersError } = await supabase
        .from('document_folders')
        .select('id')
        .eq('parent_id', id);
      
      if (subfoldersError) {
        console.error("Check subfolders error:", subfoldersError);
        toast.error("Failed to check subfolders");
        return false;
      }
      
      if (subfolders && subfolders.length > 0) {
        toast.error("Cannot delete folder with subfolders. Please delete subfolders first.");
        return false;
      }
      
      // Check for documents in folder
      const folder = await this.getFolder(id);
      if (!folder) {
        toast.error("Folder not found");
        return false;
      }
      
      const { data: documents, error: documentsError } = await supabase
        .from('documents')
        .select('id')
        .eq('folder_path', folder.name);
      
      if (documentsError) {
        console.error("Check documents error:", documentsError);
        toast.error("Failed to check documents in folder");
        return false;
      }
      
      if (documents && documents.length > 0) {
        toast.error("Cannot delete folder with documents. Please delete documents first.");
        return false;
      }
      
      // Delete folder
      const { error: deleteError } = await supabase
        .from('document_folders')
        .delete()
        .eq('id', id);
      
      if (deleteError) {
        console.error("Delete folder error:", deleteError);
        toast.error("Failed to delete folder");
        return false;
      }
      
      toast.success("Folder deleted successfully");
      return true;
    } catch (error) {
      console.error("Delete folder error:", error);
      toast.error("Failed to delete folder");
      return false;
    }
  },
  
  // Deliverables operations
  async getDeliverables(companyId: string): Promise<Deliverable[]> {
    try {
      const { data, error } = await supabase
        .from('document_deliverables')
        .select('*')
        .eq('company_id', companyId)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error("Get deliverables error:", error);
        toast.error("Failed to load deliverables");
        return [];
      }
      
      return data || [];
    } catch (error) {
      console.error("Get deliverables error:", error);
      toast.error("Failed to load deliverables");
      return [];
    }
  }
};
