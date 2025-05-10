
import { supabase } from "@/lib/supabase";

export const folderService = {
  // Function to create a new folder
  createNewFolder: async (
    bucketName: string,
    parentPath: string,
    folderName: string
  ): Promise<boolean> => {
    try {
      // Sanitize folder name (remove special characters, etc.)
      const sanitizedFolderName = folderName.replace(/[^a-zA-Z0-9-_]/g, '_');
      
      // Build the full path
      const fullPath = parentPath
        ? `${parentPath}/${sanitizedFolderName}/placeholder.txt`
        : `${sanitizedFolderName}/placeholder.txt`;
      
      // Create a placeholder file to represent the folder
      const { error } = await supabase.storage
        .from(bucketName)
        .upload(fullPath, new Blob(['placeholder']), {
          contentType: 'text/plain',
          upsert: true
        });
      
      if (error) {
        console.error("Error creating folder:", error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error("Error in createNewFolder:", error);
      return false;
    }
  },
  
  // Function to list the contents of a folder
  listFolderContents: async (
    bucketName: string,
    path: string = ''
  ): Promise<any[]> => {
    try {
      // Get all files in the bucket
      const { data: files, error } = await supabase.storage
        .from(bucketName)
        .list(path, {
          sortBy: { column: 'name', order: 'asc' }
        });
      
      if (error) {
        console.error("Error listing folder contents:", error);
        return [];
      }
      
      if (!files) return [];
      
      // Process the files and identify folders
      const items: any[] = [];
      const seenFolders = new Set<string>();
      
      // First pass: identify folders
      for (const file of files) {
        const fileName = file.name;
        
        if (file.id && !fileName.includes('/')) {
          // This is a direct file in the current directory
          items.push({
            id: file.id,
            name: fileName,
            path: path ? `${path}/${fileName}` : fileName,
            isFolder: false,
            size: file.metadata?.size,
            type: file.metadata?.mimetype,
            createdAt: file.created_at
          });
        } else if (fileName.includes('/')) {
          // This indicates a file within a subdirectory
          const folderName = fileName.split('/')[0];
          const folderPath = path ? `${path}/${folderName}` : folderName;
          
          // Only add the folder once
          if (!seenFolders.has(folderName)) {
            seenFolders.add(folderName);
            items.push({
              id: `folder_${folderPath}`,
              name: folderName, // Use the actual folder name
              path: folderPath,
              parentPath: path,
              isFolder: true
            });
          }
        }
      }
      
      return items;
    } catch (error) {
      console.error("Error in listFolderContents:", error);
      return [];
    }
  },
  
  // Function to delete a file or folder
  deleteItem: async (
    bucketName: string,
    path: string,
    isFolder: boolean
  ): Promise<boolean> => {
    try {
      if (isFolder) {
        // For a folder, we need to list and delete all contents
        const { data, error } = await supabase.storage
          .from(bucketName)
          .list(path);
          
        if (error) {
          console.error("Error listing folder contents for deletion:", error);
          return false;
        }
        
        // Delete all files in the folder
        for (const item of data || []) {
          const itemPath = `${path}/${item.name}`;
          
          // Recursively delete subfolders
          if (item.name.includes('/') || !item.id) {
            await folderService.deleteItem(bucketName, itemPath, true);
          } else {
            // Delete files
            const { error: deleteError } = await supabase.storage
              .from(bucketName)
              .remove([itemPath]);
              
            if (deleteError) {
              console.error(`Error deleting ${itemPath}:`, deleteError);
            }
          }
        }
        
        return true;
      } else {
        // For a file, simply delete it
        const { error } = await supabase.storage
          .from(bucketName)
          .remove([path]);
          
        if (error) {
          console.error("Error deleting file:", error);
          return false;
        }
        
        return true;
      }
    } catch (error) {
      console.error("Error in deleteItem:", error);
      return false;
    }
  },
  
  // Function to initialize required folders for a company
  initializeAllFolders: async (companyId: string): Promise<void> => {
    try {
      // Create base company folder by adding a placeholder
      await folderService.ensureCompanyFolder(companyId);
      
      // Create a value chain documents folder
      await folderService.ensureCompanyFolder(`value_chain/${companyId}`);
      
      // Create a deliverables folder
      await folderService.ensureCompanyFolder(`deliverables/${companyId}`);
      
      console.log(`Initialized folder structure for company ID: ${companyId}`);
    } catch (error) {
      console.error("Error initializing folders:", error);
    }
  },
  
  // Helper function to ensure a folder exists
  ensureCompanyFolder: async (folderPath: string): Promise<void> => {
    try {
      const placeholderPath = `${folderPath}/placeholder.txt`;
      
      // Check if the folder exists by trying to list it
      const { data } = await supabase.storage
        .from('company_documents_storage')
        .list(folderPath);
        
      // If folder is empty or doesn't exist, create a placeholder
      if (!data || data.length === 0) {
        await supabase.storage
          .from('company_documents_storage')
          .upload(placeholderPath, new Blob(['placeholder']), {
            contentType: 'text/plain',
            upsert: true
          });
      }
    } catch (error) {
      console.error(`Error ensuring folder ${folderPath} exists:`, error);
    }
  }
};
