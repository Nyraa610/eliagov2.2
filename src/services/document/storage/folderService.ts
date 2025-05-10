
import { supabase } from "@/lib/supabase";
import { documentUtils } from "@/services/document/documentUtils";

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
      
      // Ensure bucket exists
      await documentUtils.ensureBucketExists('company_documents_storage');
      
      // Create the folder
      return await documentUtils.createFolder('company_documents_storage', companyId);
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
      
      // First ensure the parent folder exists
      await this.ensureCompanyFolder(companyId);
      
      // Then create the personal subfolder
      return await documentUtils.createFolder('company_documents_storage', `personal/${companyId}`);
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
      
      // Ensure bucket exists
      await documentUtils.ensureBucketExists('value_chain_documents');
      
      // Create the folder
      return await documentUtils.createFolder('value_chain_documents', `value_chain/${companyId}`);
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
    
    // Try to create personal folder regardless of main folder success
    const personalFolderSuccess = await this.ensurePersonalDocumentsFolder(companyId);
    
    // Try to create value chain folder regardless of other folder success
    const valueChainFolderSuccess = await this.ensureValueChainFolder(companyId);
    
    // Return true only if all operations succeeded
    const allSucceeded = companyFolderSuccess && personalFolderSuccess && valueChainFolderSuccess;
    console.log(`Folder initialization for company ${companyId} completed with result: ${allSucceeded ? 'SUCCESS' : 'PARTIAL FAILURE'}`);
    
    return allSucceeded;
  },

  /**
   * Create new folder
   * @param bucketName The storage bucket name
   * @param parentPath Parent path
   * @param folderName Name of the folder to create
   * @returns Promise<boolean> True if folder was created successfully
   */
  async createNewFolder(bucketName: string, parentPath: string, folderName: string): Promise<boolean> {
    try {
      // Ensure valid folder name
      const sanitizedFolderName = folderName.replace(/[^\w\s-]/g, '').trim();
      if (!sanitizedFolderName) {
        throw new Error("Invalid folder name");
      }
      
      // Construct the full path
      const fullPath = parentPath 
        ? `${parentPath}/${sanitizedFolderName}`
        : sanitizedFolderName;
        
      console.log(`Creating folder ${fullPath} in bucket ${bucketName}`);
      
      // Create the folder
      return await documentUtils.createFolder(bucketName, fullPath);
    } catch (error) {
      console.error('Error creating new folder:', error);
      return false;
    }
  },
  
  /**
   * List folder contents
   * @param bucketName The storage bucket name
   * @param path The path to list
   * @returns Promise<Array<{name: string, id: string, isFolder: boolean}>>
   */
  async listFolderContents(bucketName: string, path: string = '') {
    try {
      const { data, error } = await supabase.storage
        .from(bucketName)
        .list(path, {
          sortBy: { column: 'name', order: 'asc' }
        });
      
      if (error) {
        console.error('Error listing folder contents:', error);
        return [];
      }
      
      // Filter out placeholder files
      return data
        .filter(item => item.name !== '.folder')
        .map(item => ({
          id: item.id,
          name: item.name,
          path: path ? `${path}/${item.name}` : item.name,
          parentPath: path,
          isFolder: !item.metadata,
          createdAt: item.created_at,
          ...item.metadata && {
            size: item.metadata.size,
            type: item.metadata.mimetype
          }
        }));
    } catch (error) {
      console.error('Error in listFolderContents:', error);
      return [];
    }
  },
  
  /**
   * Delete folder or file
   * @param bucketName The storage bucket name
   * @param path Path to delete
   * @param isFolder Whether this is a folder
   * @returns Promise<boolean> True if deleted successfully
   */
  async deleteItem(bucketName: string, path: string, isFolder: boolean): Promise<boolean> {
    try {
      if (isFolder) {
        // For folders, we need to recursively delete all contents
        return await this.deleteFolder(bucketName, path);
      } else {
        // For files, we can simply delete the path
        const { error } = await supabase.storage
          .from(bucketName)
          .remove([path]);
          
        if (error) {
          console.error('Error deleting file:', error);
          return false;
        }
        
        return true;
      }
    } catch (error) {
      console.error('Error in deleteItem:', error);
      return false;
    }
  },
  
  /**
   * Recursively delete a folder and all its contents
   */
  async deleteFolder(bucketName: string, folderPath: string): Promise<boolean> {
    try {
      // First list all items in the folder
      const contents = await this.listFolderContents(bucketName, folderPath);
      
      // Delete all subfolders recursively
      for (const item of contents) {
        if (item.isFolder) {
          await this.deleteFolder(bucketName, item.path);
        } else {
          await supabase.storage
            .from(bucketName)
            .remove([item.path]);
        }
      }
      
      // Delete the folder placeholder file
      await supabase.storage
        .from(bucketName)
        .remove([`${folderPath}/.folder`]);
        
      // Delete the folder itself
      await supabase.storage
        .from(bucketName)
        .remove([folderPath]);
        
      return true;
    } catch (error) {
      console.error('Error deleting folder:', error);
      return false;
    }
  },
  
  /**
   * Get the URL for a file
   * @param bucketName The storage bucket name
   * @param path Path to the file
   * @returns Promise<string | null> URL or null if error
   */
  async getFileUrl(bucketName: string, path: string): Promise<string | null> {
    try {
      const { data } = supabase.storage
        .from(bucketName)
        .getPublicUrl(path);
        
      return data.publicUrl;
    } catch (error) {
      console.error('Error getting file URL:', error);
      return null;
    }
  }
};
