import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from "sonner";

export const useSupabaseStorage = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<Error | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [bucketsInitialized, setBucketsInitialized] = useState(false);
  
  // Ensure buckets exist
  const ensureBucketExists = useCallback(async (bucketName: string): Promise<boolean> => {
    try {
      console.log(`Ensuring bucket ${bucketName} exists...`);
      
      // Get list of buckets
      const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
      
      if (bucketsError) {
        console.error("Error listing buckets:", bucketsError);
        // Continue despite error - might be a permissions issue but bucket could still exist
        return true;
      }
      
      // Check if our bucket exists
      const bucketExists = buckets?.some(b => b.name === bucketName);
      
      if (!bucketExists) {
        console.log(`Bucket ${bucketName} doesn't exist, creating it...`);
        
        // Try creating with more specific options
        const { error: createError } = await supabase.storage.createBucket(bucketName, {
          public: false,  // Set to false first, can update bucket policy later
          fileSizeLimit: 52428800, // 50MB
          allowedMimeTypes: [
            'image/png', 
            'image/jpeg', 
            'application/pdf', 
            'video/mp4', 
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/x-directory'
          ]
        });
        
        if (createError) {
          console.error(`Error creating bucket ${bucketName}:`, createError);
          
          // Check if it's a duplicate bucket error (might already exist despite not showing in list)
          if (createError.message?.includes('already exists') || 
              createError.message?.includes('duplicate')) {
            console.log(`Bucket ${bucketName} appears to already exist despite not showing in list`);
            return true;
          }
          
          // For other errors, try to continue anyway
          console.warn(`Continuing despite bucket creation error for ${bucketName}`);
          return true;
        }
        
        console.log(`Bucket ${bucketName} created successfully`);
        
        // Now set the bucket policy to public if needed
        try {
          const { error: policyError } = await supabase.storage.from(bucketName).getPublicUrl('test');
          if (policyError) {
            console.log(`Setting public policy for bucket ${bucketName}`);
            // This might fail depending on your Supabase permissions
            await supabase.rpc('update_bucket_public_access', { 
              bucket_name: bucketName, 
              public_access: true 
            });
          }
        } catch (policyErr) {
          console.warn(`Could not set public policy for ${bucketName}:`, policyErr);
          // Continue anyway
        }
      } else {
        console.log(`Bucket ${bucketName} already exists`);
      }
      
      return true;
    } catch (err) {
      console.error(`Error ensuring bucket '${bucketName}' exists:`, err);
      setError(err instanceof Error ? err : new Error(String(err)));
      // Return true to allow the application to continue
      return true;
    }
  }, []);
  
  // Initialize required buckets when the hook is first used
  useEffect(() => {
    const initBuckets = async () => {
      try {
        // Try to initialize buckets one by one
        await ensureBucketExists('company_documents_storage').catch(err => {
          console.warn(`Failed to ensure company_documents_storage exists:`, err);
          // Continue despite error
        });
        
        await ensureBucketExists('value_chain_documents').catch(err => {
          console.warn(`Failed to ensure value_chain_documents exists:`, err);
          // Continue despite error
        });
        
        await ensureBucketExists('training_materials').catch(err => {
          console.warn(`Failed to ensure training_materials exists:`, err);
          // Continue despite error
        });
        
        // Mark as initialized even if there were errors
        setBucketsInitialized(true);
      } catch (err) {
        console.error("Error initializing buckets:", err);
        // Mark as initialized anyway to prevent infinite retries
        setBucketsInitialized(true);
      }
    };
    
    if (!bucketsInitialized) {
      initBuckets();
    }
  }, [ensureBucketExists, bucketsInitialized]);
  
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
      // Try to upload even if bucket creation failed
      // Bucket might already exist despite errors
      
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
  }, []);
  
  const createFolderPath = useCallback(async (
    bucketName: string,
    folderPath: string
  ): Promise<boolean> => {
    try {
      // Create a placeholder file to establish the folder structure
      // Don't wait for bucket creation - it might already exist
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
  }, []);
  
  return {
    uploadFile,
    ensureBucketExists,
    createFolderPath,
    isUploading,
    progress,
    error,
    uploadedUrl,
    bucketsInitialized
  };
};
