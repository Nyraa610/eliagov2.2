
import { supabase } from "@/lib/supabase";

export function useBucketManagement() {
  /**
   * Ensure the storage bucket exists
   * @param bucketName Name of the bucket to check/create
   * @returns Promise<boolean> indicating if the bucket exists or was created
   */
  const ensureBucketExists = async (bucketName: string): Promise<boolean> => {
    try {
      // First check if bucket exists
      const { data, error } = await supabase.storage.listBuckets();
      
      if (error) {
        console.error('Error checking buckets:', error);
        return false;
      }
      
      // Check if our bucket exists in the list
      if (!data.find(bucket => bucket.name === bucketName)) {
        console.log('Bucket not found, attempting to create it');
        
        // Create the bucket if it doesn't exist
        const { error: createError } = await supabase.storage.createBucket(bucketName, {
          public: true
        });
        
        if (createError) {
          console.error('Error creating bucket:', createError);
          return false;
        }
        
        console.log(`Created bucket ${bucketName} successfully`);
      } else {
        console.log(`Bucket ${bucketName} already exists`);
      }
      
      return true;
    } catch (err) {
      console.error('Error ensuring bucket exists:', err);
      return false;
    }
  };

  return {
    ensureBucketExists
  };
}
