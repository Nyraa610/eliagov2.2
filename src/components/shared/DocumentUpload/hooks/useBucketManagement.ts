
import { useCallback, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export function useBucketManagement() {
  const [initializingBucket, setInitializingBucket] = useState(false);
  const [bucketError, setBucketError] = useState<Error | null>(null);

  const ensureBucketExists = useCallback(async (bucketName: string): Promise<boolean> => {
    try {
      setInitializingBucket(true);
      setBucketError(null);
      
      console.log(`Ensuring bucket ${bucketName} exists...`);
      
      // Check if the bucket exists first
      const { data: buckets, error: listError } = await supabase.storage.listBuckets();
      
      if (listError) {
        console.error("Error listing buckets:", listError);
        // Continue anyway - the bucket might exist despite the error
      }
      
      const bucketExists = buckets?.some(bucket => bucket.name === bucketName);
      
      if (!bucketExists) {
        console.log(`Bucket ${bucketName} not found, attempting to create it...`);
        
        // Try first with direct creation (might work if permissions are correct)
        try {
          const { error: createError } = await supabase.storage.createBucket(bucketName, {
            public: true, 
            fileSizeLimit: 52428800, // 50MB
          });
          
          if (!createError) {
            console.log(`Successfully created bucket: ${bucketName} directly`);
            return true;
          } else {
            console.log(`Direct bucket creation failed, trying edge function: ${createError.message}`);
          }
        } catch (directError) {
          console.log('Direct bucket creation failed, trying edge function:', directError);
        }
        
        // If direct creation fails, try using edge function
        try {
          const { error: functionError } = await supabase.functions.invoke('initialize-storage', {
            body: { bucketName }
          });
          
          if (functionError) {
            console.error(`Error creating bucket ${bucketName} via edge function:`, functionError);
            toast.error("Storage initialization failed. Please try again later.");
            setBucketError(new Error(`Failed to create bucket: ${functionError.message}`));
            return false;
          }
          
          console.log(`Successfully created bucket: ${bucketName} via edge function`);
          return true;
        } catch (functionCallError) {
          console.error(`Error in edge function call:`, functionCallError);
          setBucketError(functionCallError instanceof Error ? functionCallError : new Error(String(functionCallError)));
          return false;
        }
      }
      
      console.log(`Bucket ${bucketName} already exists`);
      return true;
    } catch (error) {
      console.error('Error ensuring bucket exists:', error);
      setBucketError(error instanceof Error ? error : new Error(String(error)));
      return false;
    } finally {
      setInitializingBucket(false);
    }
  }, []);
  
  return {
    ensureBucketExists,
    initializingBucket,
    bucketError
  };
}
