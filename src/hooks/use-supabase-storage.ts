
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from "sonner";

export const useSupabaseStorage = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<Error | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  
  // Ensure buckets exist
  const ensureBucketExists = useCallback(async (bucketName: string): Promise<boolean> => {
    try {
      console.log(`Ensuring bucket ${bucketName} exists...`);
      
      // Get list of buckets
      const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
      
      if (bucketsError) {
        console.error("Error listing buckets:", bucketsError);
        return false;
      }
      
      // Check if our bucket exists
      const bucketExists = buckets?.some(b => b.name === bucketName);
      
      if (!bucketExists) {
        console.log(`Bucket ${bucketName} doesn't exist, creating it...`);
        const { error: createError } = await supabase.storage.createBucket(bucketName, {
          public: true
        });
        
        if (createError) {
          console.error(`Error creating bucket ${bucketName}:`, createError);
          return false;
        }
        
        console.log(`Bucket ${bucketName} created successfully`);
      } else {
        console.log(`Bucket ${bucketName} already exists`);
      }
      
      return true;
    } catch (err) {
      console.error(`Error ensuring bucket '${bucketName}' exists:`, err);
      setError(err instanceof Error ? err : new Error(String(err)));
      return false;
    }
  }, []);
  
  // Initialize required buckets when the hook is first used
  useEffect(() => {
    const initBuckets = async () => {
      await ensureBucketExists('company_documents_storage');
      await ensureBucketExists('value_chain_documents');
      await ensureBucketExists('training_materials');
    };
    
    initBuckets();
  }, [ensureBucketExists]);
  
  const uploadFile = useCallback(async (
    bucketName: string,
    filePath: string,
    file: File
  ): Promise<string> => {
    setIsUploading(true);
    setProgress(0);
    setError(null);
    setUploadedUrl(null);
    
    console.log(`Starting upload to ${bucketName}/${filePath}`);
    
    try {
      // Ensure bucket exists before uploading
      const bucketExists = await ensureBucketExists(bucketName);
      if (!bucketExists) {
        throw new Error(`Failed to ensure bucket ${bucketName} exists`);
      }
      
      // Show progress updates
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 5;
        });
      }, 100);
      
      // Upload file
      const { data, error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });
      
      clearInterval(progressInterval);
      
      if (uploadError) {
        console.error(`Upload error for ${bucketName}/${filePath}:`, uploadError);
        throw uploadError;
      }
      
      console.log(`Upload successful to ${bucketName}/${filePath}`);
      
      // Get public URL
      const { data: urlData } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath);
      
      if (!urlData || !urlData.publicUrl) {
        throw new Error(`Failed to get public URL for ${bucketName}/${filePath}`);
      }
      
      setUploadedUrl(urlData.publicUrl);
      setProgress(100);
      
      return urlData.publicUrl;
    } catch (err) {
      console.error(`Error in uploadFile:`, err);
      setError(err instanceof Error ? err : new Error(String(err)));
      toast.error(`Upload failed: ${err instanceof Error ? err.message : String(err)}`);
      throw err;
    } finally {
      setIsUploading(false);
    }
  }, [ensureBucketExists]);
  
  const createFolderPath = useCallback(async (
    bucketName: string,
    folderPath: string
  ): Promise<boolean> => {
    try {
      // Ensure bucket exists
      const bucketExists = await ensureBucketExists(bucketName);
      if (!bucketExists) {
        throw new Error(`Failed to ensure bucket ${bucketName} exists`);
      }
      
      // Create a placeholder file to establish the folder structure
      const placeholderPath = `${folderPath}/.folder`;
      
      const { error } = await supabase.storage
        .from(bucketName)
        .upload(placeholderPath, new Uint8Array(0), {
          contentType: 'application/x-directory',
          upsert: true
        });
        
      if (error) {
        console.error(`Error creating folder ${folderPath} in ${bucketName}:`, error);
        return false;
      }
      
      console.log(`Created folder ${folderPath} in bucket ${bucketName}`);
      return true;
    } catch (err) {
      console.error(`Error creating folder path:`, err);
      return false;
    }
  }, [ensureBucketExists]);
  
  return {
    uploadFile,
    ensureBucketExists,
    createFolderPath,
    isUploading,
    progress,
    error,
    uploadedUrl
  };
};
