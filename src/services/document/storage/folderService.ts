
import { supabase } from "@/lib/supabase";
import { storageBucketService } from "./storageBucketService";

/**
 * Service to handle folder operations
 */
export const folderService = {
  /**
   * Ensure company folder exists in storage
   * @param companyId Company ID for folder
   * @returns Promise<boolean> True if folder exists or was created
   */
  async ensureCompanyFolder(companyId: string): Promise<boolean> {
    try {
      // Create a placeholder file to establish folder structure
      const folderPath = `${companyId}/.folder`;
      
      await storageBucketService.ensureStorageBucketExists();
      
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
  }
};
