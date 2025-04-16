
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const STAKEHOLDER_DOCS_BUCKET = 'stakeholder-documents';

export type UploadedDocument = {
  id: string;
  name: string;
  url: string;
  file_type?: string;
  size?: number;
};

export const supabaseStorageService = {
  /**
   * Ensure a storage bucket exists
   * @param bucketName Name of the bucket to ensure exists
   * @returns Promise<boolean> Whether the bucket exists or was created
   */
  async ensureBucketExists(bucketName: string): Promise<boolean> {
    try {
      // Check if bucket exists
      const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
      
      if (bucketsError) {
        console.error("Error listing buckets:", bucketsError);
        return false;
      }
      
      const bucketExists = buckets.some(bucket => bucket.name === bucketName);
      
      if (!bucketExists) {
        // Try to create the bucket using edge function with admin rights
        const { error: functionError } = await supabase.functions.invoke('initialize-storage', {
          body: { bucketName }
        });
        
        if (functionError) {
          console.error(`Error creating bucket ${bucketName}:`, functionError);
          toast.error("Storage initialization failed. Please try again later.");
          return false;
        }
        
        return true;
      }
      
      return true;
    } catch (error) {
      console.error("Error ensuring bucket exists:", error);
      return false;
    }
  },
  
  /**
   * Upload documents to Supabase Storage
   * @param files Files to upload
   * @param folder Folder path within the bucket (optional)
   * @returns Promise<UploadedDocument[]> Array of uploaded document information
   */
  async uploadDocuments(files: File[], folder?: string): Promise<UploadedDocument[]> {
    if (!files.length) return [];
    
    try {
      // Ensure bucket exists
      const bucketExists = await this.ensureBucketExists(STAKEHOLDER_DOCS_BUCKET);
      if (!bucketExists) {
        throw new Error("Failed to initialize storage bucket");
      }
      
      const uploadPromises = files.map(async (file) => {
        // Create a safe path with timestamp
        const filePath = folder 
          ? `${folder}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
          : `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
        
        // Upload file
        const { error: uploadError } = await supabase.storage
          .from(STAKEHOLDER_DOCS_BUCKET)
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: true
          });
          
        if (uploadError) {
          console.error(`Error uploading file ${file.name}:`, uploadError);
          throw uploadError;
        }
        
        // Get public URL
        const { data: urlData } = supabase.storage
          .from(STAKEHOLDER_DOCS_BUCKET)
          .getPublicUrl(filePath);
          
        // Return the document info
        return {
          id: filePath, // Use the path as the ID
          name: file.name,
          url: urlData.publicUrl,
          file_type: file.type,
          size: file.size
        };
      });
      
      const results = await Promise.all(uploadPromises);
      
      if (results.length > 0) {
        toast.success(`Uploaded ${results.length} document${results.length > 1 ? 's' : ''} successfully`);
      }
      
      return results;
    } catch (error) {
      console.error("Error uploading documents:", error);
      toast.error("Failed to upload documents");
      return [];
    }
  },
  
  /**
   * Delete a document from Supabase Storage
   * @param filePath Path of the file to delete
   * @returns Promise<boolean> Whether deletion was successful
   */
  async deleteDocument(filePath: string): Promise<boolean> {
    try {
      // If the filePath is a URL, extract the path part
      if (filePath.startsWith('http')) {
        const url = new URL(filePath);
        
        // Extract the path from the URL (after the bucket name)
        const pathParts = url.pathname.split('/');
        const bucketIndex = pathParts.findIndex(part => part === STAKEHOLDER_DOCS_BUCKET);
        
        if (bucketIndex >= 0 && bucketIndex < pathParts.length - 1) {
          filePath = pathParts.slice(bucketIndex + 1).join('/');
        } else {
          console.error("Could not extract file path from URL:", filePath);
          return false;
        }
      }
      
      // Delete the file
      const { error } = await supabase.storage
        .from(STAKEHOLDER_DOCS_BUCKET)
        .remove([filePath]);
        
      if (error) {
        console.error("Error deleting file:", error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error("Error deleting document:", error);
      return false;
    }
  }
};
