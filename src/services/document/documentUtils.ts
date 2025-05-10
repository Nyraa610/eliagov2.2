
import { supabase } from "@/lib/supabase";
import { saveAs } from 'file-saver';
import { toast } from "sonner";

/**
 * Service for document utility functions
 */
export const documentUtils = {
  /**
   * Create and download a document from template
   */
  async createDocumentFromTemplate(templatePath: string, data: any, outputFilename: string) {
    try {
      // Fetch the template file
      const response = await fetch(templatePath);
      if (!response.ok) {
        throw new Error(`Failed to fetch template: ${response.status} ${response.statusText}`);
      }
      
      const blob = await response.blob();
      
      // Save the file
      saveAs(blob, outputFilename);
      
      return true;
    } catch (error) {
      console.error("Error creating document from template:", error);
      toast.error("Failed to generate document from template");
      return false;
    }
  },

  /**
   * Creates a document from template but returns it as a blob instead of downloading
   */
  async createDocumentBlobFromTemplate(templatePath: string, data: any) {
    try {
      // Fetch the template file
      const response = await fetch(templatePath);
      if (!response.ok) {
        throw new Error(`Failed to fetch template: ${response.status} ${response.statusText}`);
      }
      
      // Return the blob directly
      return await response.blob();
    } catch (error) {
      console.error("Error creating document blob from template:", error);
      toast.error("Failed to generate document blob");
      return null;
    }
  },

  /**
   * Ensure storage bucket exists
   */
  async ensureBucketExists(bucketName: string): Promise<boolean> {
    try {
      // Check if the bucket exists
      const { data: buckets, error: listError } = await supabase.storage.listBuckets();
      
      if (listError) {
        console.error(`Error listing buckets:`, listError);
        return false;
      }
      
      const bucketExists = buckets.some(bucket => bucket.name === bucketName);
      
      if (!bucketExists) {
        console.log(`Bucket ${bucketName} doesn't exist, attempting to create it...`);
        
        try {
          const { error: functionError } = await supabase.functions.invoke('initialize-storage', {
            body: { bucketName }
          });
          
          if (functionError) {
            console.error(`Error creating bucket ${bucketName}:`, functionError);
            return false;
          }
          
          console.log(`Successfully created bucket ${bucketName}`);
          return true;
        } catch (edgeFunctionError) {
          console.error(`Error in edge function:`, edgeFunctionError);
          return false;
        }
      }
      
      return true;
    } catch (error) {
      console.error('Error ensuring bucket exists:', error);
      return false;
    }
  },

  /**
   * Create folder in storage
   */
  async createFolder(bucketName: string, folderPath: string): Promise<boolean> {
    try {
      // Ensure folder path ends with a slash if it doesn't already
      const normalizedPath = folderPath.endsWith('/') ? folderPath : `${folderPath}/`;
      
      // Create a placeholder file to establish the folder
      const { error } = await supabase.storage
        .from(bucketName)
        .upload(`${normalizedPath}.folder`, new Uint8Array(0), {
          contentType: 'application/x-directory',
          upsert: true
        });
        
      if (error) {
        console.error(`Error creating folder in ${bucketName}:`, error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error creating folder:', error);
      return false;
    }
  },

  /**
   * Replace placeholders in the document with actual values
   */
  replacePlaceholders(text: string, data: Record<string, any>): string {
    let result = text;
    
    // Replace simple placeholders like [CompanyName]
    for (const [key, value] of Object.entries(data)) {
      if (typeof value === 'string') {
        const placeholder = `[${key}]`;
        result = result.replace(new RegExp(placeholder, 'g'), value);
      }
    }
    
    return result;
  },

  /**
   * Prepare document data for template processing
   * Flattens nested objects to make them accessible to the template engine
   */
  prepareDocumentData(data: Record<string, any>): Record<string, any> {
    const result: Record<string, any> = {};
    
    function flatten(obj: Record<string, any>, prefix = '') {
      for (const [key, value] of Object.entries(obj)) {
        const newKey = prefix ? `${prefix}.${key}` : key;
        
        if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
          flatten(value, newKey);
        } else {
          result[newKey] = value;
        }
      }
    }
    
    // First copy all top-level properties
    Object.assign(result, data);
    
    // Then flatten nested objects for easier access in templates
    flatten(data);
    
    return result;
  }
};
