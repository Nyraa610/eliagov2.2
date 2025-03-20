
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export const useSupabaseStorage = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<Error | null>(null);
  
  useEffect(() => {
    // Ensure required buckets exist on component mount
    const createRequiredBuckets = async () => {
      try {
        // Get list of buckets
        const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
        
        if (bucketsError) {
          console.error("Error listing buckets:", bucketsError);
          return;
        }
        
        // Check if our bucket exists
        const valueChainBucketExists = buckets?.some(b => b.name === 'value_chain_documents');
        
        if (!valueChainBucketExists) {
          console.log("Creating value_chain_documents bucket...");
          
          const { error: createError } = await supabase.storage.createBucket('value_chain_documents', {
            public: true
          });
          
          if (createError) {
            console.error("Error creating bucket:", createError);
          } else {
            console.log("Bucket 'value_chain_documents' created successfully");
          }
        }
      } catch (err) {
        console.error("Error initializing storage buckets:", err);
      }
    };
    
    createRequiredBuckets();
  }, []);
  
  const ensureBucketExists = async (bucketName: string): Promise<boolean> => {
    try {
      // Get list of buckets
      const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
      
      if (bucketsError) {
        throw bucketsError;
      }
      
      // Check if our bucket exists
      const bucketExists = buckets?.some(b => b.name === bucketName);
      
      if (!bucketExists) {
        const { error: createError } = await supabase.storage.createBucket(bucketName, {
          public: true
        });
        
        if (createError) {
          throw createError;
        }
      }
      
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
      
      // Upload file
      const { error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });
      
      if (uploadError) {
        throw uploadError;
      }
      
      // Get public URL
      const { data } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath);
      
      if (!data || !data.publicUrl) {
        throw new Error(`Failed to get public URL for ${bucketName}/${filePath}`);
      }
      
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
