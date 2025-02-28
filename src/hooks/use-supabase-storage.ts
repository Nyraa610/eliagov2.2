
import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export const useSupabaseStorage = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<Error | null>(null);
  
  const ensureBucketExists = async (bucketName: string): Promise<boolean> => {
    try {
      console.log(`Checking if bucket '${bucketName}' exists...`);
      
      // Get list of buckets
      const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
      
      if (bucketsError) {
        console.error("Error listing buckets:", bucketsError);
        throw bucketsError;
      }
      
      // Check if our bucket exists
      const bucketExists = buckets?.some(b => b.name === bucketName);
      
      if (!bucketExists) {
        console.log(`Creating bucket '${bucketName}'...`);
        
        const { error: createError } = await supabase.storage.createBucket(bucketName, {
          public: true
        });
        
        if (createError) {
          console.error(`Error creating bucket '${bucketName}':`, createError);
          throw createError;
        }
        
        console.log(`Bucket '${bucketName}' created successfully.`);
        return true;
      }
      
      console.log(`Bucket '${bucketName}' already exists.`);
      return true;
    } catch (err) {
      console.error(`Error ensuring bucket '${bucketName}' exists:`, err);
      setError(err instanceof Error ? err : new Error(String(err)));
      return false;
    }
  };
  
  const uploadFile = async (
    bucketName: string,
    filePath: string,
    file: File
  ): Promise<string> => {
    setIsUploading(true);
    setProgress(0);
    setError(null);
    
    try {
      // Ensure bucket exists
      await ensureBucketExists(bucketName);
      
      console.log(`Uploading file to ${bucketName}/${filePath}...`);
      
      // Upload file
      const { error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });
      
      if (uploadError) {
        console.error(`Error uploading to ${bucketName}/${filePath}:`, uploadError);
        throw uploadError;
      }
      
      console.log(`File uploaded successfully to ${bucketName}/${filePath}.`);
      
      // Get public URL
      const { data } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath);
      
      if (!data || !data.publicUrl) {
        throw new Error(`Failed to get public URL for ${bucketName}/${filePath}`);
      }
      
      console.log(`Public URL: ${data.publicUrl}`);
      
      return data.publicUrl;
    } catch (err) {
      console.error(`Error in uploadFile:`, err);
      setError(err instanceof Error ? err : new Error(String(err)));
      throw err;
    } finally {
      setIsUploading(false);
      setProgress(100);
    }
  };
  
  return {
    uploadFile,
    ensureBucketExists,
    isUploading,
    progress,
    error
  };
};
