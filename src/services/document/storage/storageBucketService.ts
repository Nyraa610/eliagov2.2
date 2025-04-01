
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

/**
 * Service to handle storage bucket operations
 */
export const storageBucketService = {
  /**
   * Ensure the document storage bucket exists
   * @returns Promise<boolean> True if the bucket exists or was created
   */
  async ensureStorageBucketExists(): Promise<boolean> {
    try {
      // Check if the bucket exists
      const { data: buckets, error: listError } = await supabase.storage.listBuckets();
      
      if (listError) {
        console.error('Error listing buckets:', listError);
        throw new Error('Failed to check storage buckets');
      }
      
      const bucketExists = buckets.some(bucket => bucket.name === 'company_documents_storage');
      
      if (!bucketExists) {
        // Create the bucket if it doesn't exist
        const { error: createError } = await supabase.storage.createBucket('company_documents_storage', {
          public: true
        });
        
        if (createError) {
          console.error('Error creating bucket:', createError);
          throw new Error('Failed to create storage bucket');
        }
        
        console.log('Created company_documents_storage bucket successfully');
      } else {
        console.log('company_documents_storage bucket already exists');
      }
      
      return true;
    } catch (error) {
      console.error('Error ensuring bucket exists:', error);
      return false;
    }
  }
};
