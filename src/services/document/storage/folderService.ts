
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
      
      // Try direct upload first
      try {
        const { error } = await supabase.storage
          .from('company_documents_storage')
          .upload(folderPath, new Uint8Array(0), {
            contentType: 'application/x-directory',
            upsert: true
          });
          
        if (!error) {
          console.log(`Company folder for ID ${companyId} initialized directly`);
          
          // Also create personal documents subfolder
          await this.ensurePersonalDocumentsFolder(companyId);
          
          return true;
        }
        
        console.log(`Direct folder creation failed: ${error.message}. Trying via edge function...`);
      } catch (directError) {
        console.log('Direct folder creation failed, trying edge function:', directError);
      }
      
      // If direct upload fails, try using edge function
      const { error: functionError } = await supabase.functions.invoke("initialize-company-storage", {
        body: { companyId }
      });
      
      if (functionError) {
        console.error('Error initializing company folder via edge function:', functionError);
        return false;
      }
      
      console.log(`Company folder for ID ${companyId} initialized via edge function`);
      
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
      
      // Try direct upload first
      try {
        const { error } = await supabase.storage
          .from('company_documents_storage')
          .upload(personalFolderPath, new Uint8Array(0), {
            contentType: 'application/x-directory',
            upsert: true
          });
          
        if (!error) {
          console.log(`Personal documents folder for company ${companyId} initialized directly`);
          return true;
        }
        
        console.log(`Direct personal folder creation failed: ${error.message}`);
      } catch (directError) {
        console.log('Direct personal folder creation failed:', directError);
      }
      
      // If direct upload fails, check if edge function already created it
      const { data: existingFiles, error: listError } = await supabase.storage
        .from('company_documents_storage')
        .list(`personal/${companyId}`);
        
      if (!listError && existingFiles && existingFiles.length > 0) {
        console.log(`Personal documents folder for company ${companyId} already exists`);
        return true;
      }
      
      console.log(`Personal documents folder for company ${companyId} could not be initialized`);
      return false;
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
      
      // Try direct upload first
      try {
        const { error } = await supabase.storage
          .from('value_chain_documents')
          .upload(valueChainFolderPath, new Uint8Array(0), {
            contentType: 'application/x-directory',
            upsert: true
          });
          
        if (!error) {
          console.log(`Value chain folder for company ${companyId} initialized directly`);
          return true;
        }
        
        console.log(`Direct value chain folder creation failed: ${error.message}`);
      } catch (directError) {
        console.log('Direct value chain folder creation failed:', directError);
      }
      
      // If direct upload fails, check if edge function already created it
      const { data: existingFiles, error: listError } = await supabase.storage
        .from('value_chain_documents')
        .list(`value_chain/${companyId}`);
        
      if (!listError && existingFiles && existingFiles.length > 0) {
        console.log(`Value chain folder for company ${companyId} already exists`);
        return true;
      }
      
      console.log(`Value chain folder for company ${companyId} could not be initialized`);
      return false;
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
