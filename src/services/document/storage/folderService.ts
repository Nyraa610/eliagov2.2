
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
      
      // First check if folder already exists
      const { data: existingFiles, error: listError } = await supabase.storage
        .from('company_documents_storage')
        .list(companyId);
        
      if (!listError && existingFiles && existingFiles.length > 0) {
        console.log(`Company folder for ID ${companyId} already exists`);
        return true;
      }
      
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
      
      // Also create personal documents subfolder
      await this.ensurePersonalDocumentsFolder(companyId);
      
      return true;
    } catch (error) {
      console.error('Error initializing company folder:', error);
      return false;
    }
  },
  
  /**
   * Ensure personal documents folder exists for a company
   * @param companyId Company ID
   * @returns Promise<boolean> True if folder exists or was created
   */
  async ensurePersonalDocumentsFolder(companyId: string): Promise<boolean> {
    try {
      const personalFolderPath = `personal/${companyId}/.folder`;
      
      const { error } = await supabase.storage
        .from('company_documents_storage')
        .upload(personalFolderPath, new Uint8Array(0), {
          contentType: 'application/x-directory',
          upsert: true
        });
        
      if (error) {
        console.error('Error creating personal documents folder:', error);
        return false;
      }
      
      console.log(`Personal documents folder for company ${companyId} initialized`);
      return true;
    } catch (error) {
      console.error('Error initializing personal documents folder:', error);
      return false;
    }
  },
  
  /**
   * Ensure value chain folder exists for a company
   * @param companyId Company ID
   * @returns Promise<boolean> True if folder exists or was created
   */
  async ensureValueChainFolder(companyId: string): Promise<boolean> {
    try {
      const valueChainFolderPath = `value_chain/${companyId}/.folder`;
      
      await storageBucketService.ensureValueChainBucketExists();
      
      const { error } = await supabase.storage
        .from('value_chain_documents')
        .upload(valueChainFolderPath, new Uint8Array(0), {
          contentType: 'application/x-directory',
          upsert: true
        });
        
      if (error) {
        console.error('Error creating value chain folder:', error);
        return false;
      }
      
      console.log(`Value chain folder for company ${companyId} initialized`);
      return true;
    } catch (error) {
      console.error('Error initializing value chain folder:', error);
      return false;
    }
  },
  
  /**
   * Initialize all required folders for a company
   * @param companyId Company ID
   * @returns Promise<boolean> True if all folders were created successfully
   */
  async initializeAllFolders(companyId: string): Promise<boolean> {
    const results = await Promise.all([
      this.ensureCompanyFolder(companyId),
      this.ensureValueChainFolder(companyId)
    ]);
    
    return results.every(result => result === true);
  }
};
