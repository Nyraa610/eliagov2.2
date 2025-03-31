
import { supabase } from "@/lib/supabase";
import { DocumentFolder } from "./types";

export const folderService = {
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
  }
};
