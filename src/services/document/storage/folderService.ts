
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
      console.log(`Ensuring company folder exists for ID ${companyId}...`);
      
      // First check if folder already exists
      try {
        const { data: existingFiles, error: listError } = await supabase.storage
          .from('company_documents_storage')
          .list(companyId);
          
        if (!listError && existingFiles && existingFiles.length > 0) {
          console.log(`Company folder for ID ${companyId} already exists`);
          return true;
        }
      } catch (listError) {
        console.log(`Error checking if folder exists: ${listError}`);
        // Continue with creation attempts even if list check fails
      }
      
      await storageBucketService.ensureStorageBucketExists();
      
      // Create a placeholder file to establish folder structure
      const folderPath = `${companyId}/.folder`;
      
      // Try all available methods to ensure folder creation succeeds
      
      // Method 1: Direct upload
      try {
        console.log(`Attempting direct upload for company folder ${companyId}...`);
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
        
        console.log(`Direct folder creation failed: ${error.message}. Trying edge function...`);
      } catch (directError) {
        console.log('Direct folder creation failed, trying edge function:', directError);
      }
      
      // Method 2: Using edge function
      try {
        console.log(`Attempting edge function for company folder ${companyId}...`);
        const { data, error: functionError } = await supabase.functions.invoke("initialize-company-storage", {
          body: { companyId, companyName: "" }
        });
        
        if (functionError) {
          console.error('Error initializing company folder via edge function:', functionError);
          // Don't return false yet, let's check if folder was actually created despite the error
        } else {
          console.log(`Company folder for ID ${companyId} initialized via edge function`);
          return true;
        }
      } catch (edgeFunctionError) {
        console.error('Exception calling edge function:', edgeFunctionError);
        // Don't return false yet, let's check if folder was actually created despite the error
      }
      
      // Final check - did any method succeed?
      try {
        const { data: checkFiles, error: checkError } = await supabase.storage
          .from('company_documents_storage')
          .list(companyId);
          
        if (!checkError && checkFiles && checkFiles.length > 0) {
          console.log(`Company folder for ID ${companyId} exists after creation attempts`);
          return true;
        }
      } catch (checkError) {
        console.log(`Error on final folder existence check: ${checkError}`);
      }
      
      console.error(`Failed to create company folder for ID ${companyId} after all attempts`);
      return false;
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
      console.log(`Ensuring personal folder exists for company ID ${companyId}...`);
      
      // First check if folder already exists
      try {
        const { data: existingFiles, error: listError } = await supabase.storage
          .from('company_documents_storage')
          .list(`personal/${companyId}`);
          
        if (!listError && existingFiles && existingFiles.length > 0) {
          console.log(`Personal documents folder for company ${companyId} already exists`);
          return true;
        }
      } catch (listError) {
        console.log(`Error checking if personal folder exists: ${listError}`);
        // Continue with creation attempts even if list check fails
      }
      
      const personalFolderPath = `personal/${companyId}/.folder`;
      
      // Try direct upload first
      try {
        console.log(`Attempting direct upload for personal folder ${companyId}...`);
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
      
      // Final check - did any method succeed?
      try {
        const { data: checkFiles, error: checkError } = await supabase.storage
          .from('company_documents_storage')
          .list(`personal/${companyId}`);
          
        if (!checkError && checkFiles && checkFiles.length > 0) {
          console.log(`Personal folder for company ID ${companyId} exists after creation attempts`);
          return true;
        }
      } catch (checkError) {
        console.log(`Error on final personal folder existence check: ${checkError}`);
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
      console.log(`Ensuring value chain folder exists for company ID ${companyId}...`);
      
      // First check if folder already exists
      try {
        const { data: existingFiles, error: listError } = await supabase.storage
          .from('value_chain_documents')
          .list(`value_chain/${companyId}`);
          
        if (!listError && existingFiles && existingFiles.length > 0) {
          console.log(`Value chain folder for company ${companyId} already exists`);
          return true;
        }
      } catch (listError) {
        console.log(`Error checking if value chain folder exists: ${listError}`);
        // Continue with creation attempts even if list check fails
      }
      
      await storageBucketService.ensureValueChainBucketExists();
      
      const valueChainFolderPath = `value_chain/${companyId}/.folder`;
      
      // Try direct upload first
      try {
        console.log(`Attempting direct upload for value chain folder ${companyId}...`);
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
      
      // Final check - did any method succeed?
      try {
        const { data: checkFiles, error: checkError } = await supabase.storage
          .from('value_chain_documents')
          .list(`value_chain/${companyId}`);
          
        if (!checkError && checkFiles && checkFiles.length > 0) {
          console.log(`Value chain folder for company ID ${companyId} exists after creation attempts`);
          return true;
        }
      } catch (checkError) {
        console.log(`Error on final value chain folder existence check: ${checkError}`);
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
    console.log(`Initializing all folders for company ID ${companyId}...`);
    
    // Create company folder first
    const companyFolderSuccess = await this.ensureCompanyFolder(companyId);
    
    if (!companyFolderSuccess) {
      console.error(`Failed to create main company folder for ${companyId}`);
    }
    
    // Try to create personal folder regardless of main folder success
    const personalFolderSuccess = await this.ensurePersonalDocumentsFolder(companyId);
    
    if (!personalFolderSuccess) {
      console.error(`Failed to create personal folder for ${companyId}`);
    }
    
    // Try to create value chain folder regardless of other folder success
    const valueChainFolderSuccess = await this.ensureValueChainFolder(companyId);
    
    if (!valueChainFolderSuccess) {
      console.error(`Failed to create value chain folder for ${companyId}`);
    }
    
    // Return true only if all operations succeeded
    const allSucceeded = companyFolderSuccess && personalFolderSuccess && valueChainFolderSuccess;
    console.log(`Folder initialization for company ${companyId} completed with result: ${allSucceeded ? 'SUCCESS' : 'PARTIAL FAILURE'}`);
    
    return allSucceeded;
  }
};
