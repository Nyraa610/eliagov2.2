
import { useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export function useBucketManagement() {
  const ensureBucketExists = useCallback(async (bucketName: string): Promise<boolean> => {
    try {
      console.log(`Ensuring bucket ${bucketName} exists...`);
      
      // Check if the bucket exists
      const { data: buckets, error: listError } = await supabase.storage.listBuckets();
      
      if (listError) {
        console.error("Error listing buckets:", listError);
        return false;
      }
      
      const bucketExists = buckets.some(bucket => bucket.name === bucketName);
      
      if (!bucketExists) {
        // Try to create the bucket using edge function with admin rights
        try {
          const { error: functionError } = await supabase.functions.invoke('initialize-storage', {
            body: { bucketName }
          });
          
          if (functionError) {
            console.error(`Error creating bucket ${bucketName}:`, functionError);
            toast.error("Storage initialization failed. Please try again later.");
            return false;
          }
          
          console.log(`Successfully created bucket: ${bucketName}`);
          return true;
        } catch (error) {
          console.error(`Error in edge function:`, error);
          return false;
        }
      }
      
      console.log(`Bucket ${bucketName} already exists`);
      return true;
    } catch (error) {
      console.error('Error ensuring bucket exists:', error);
      return false;
    }
  }, []);
  
  return {
    ensureBucketExists
  };
}
