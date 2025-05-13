
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
    return this.ensureBucketExists('company documents storage');
  },
  
  /**
   * Ensure the value chain document bucket exists
   * @returns Promise<boolean> True if the bucket exists or was created
   */
  async ensureValueChainBucketExists(): Promise<boolean> {
    return this.ensureBucketExists('value_chain_documents');
  },
  
  /**
   * Ensure the training materials bucket exists
   * @returns Promise<boolean> True if the bucket exists or was created
   */
  async ensureTrainingMaterialsBucketExists(): Promise<boolean> {
    return this.ensureBucketExists('training_materials');
  },
  
  /**
   * Generic method to ensure a bucket exists
   * @param bucketName Name of the bucket to check/create
   * @returns Promise<boolean> True if the bucket exists or was created
   */
  async ensureBucketExists(bucketName: string): Promise<boolean> {
    try {
      // Check if the bucket exists
      const { data: buckets, error: listError } = await supabase.storage.listBuckets();
      
      if (listError) {
        console.error(`Error listing buckets:`, listError);
        throw new Error('Failed to check storage buckets');
      }
      
      const bucketExists = buckets.some(bucket => bucket.name === bucketName);
      
      if (!bucketExists) {
        // Attempt to create the bucket using an edge function which has admin rights
        console.log(`Bucket ${bucketName} doesn't exist, creating it using edge function...`);
        
        try {
          const { error: functionError } = await supabase.functions.invoke('initialize-storage', {
            body: { bucketName }
          });
          
          if (functionError) {
            console.error(`Error invoking edge function to create bucket ${bucketName}:`, functionError);
            toast.error(`Error initializing storage. Please contact support.`);
            return false;
          }
          
          console.log(`Successfully created bucket: ${bucketName}`);
          return true;
        } catch (edgeFunctionError) {
          console.error(`Error in edge function:`, edgeFunctionError);
          return false;
        }
      } else {
        console.log(`Bucket ${bucketName} already exists`);
        return true;
      }
    } catch (error) {
      console.error('Error ensuring bucket exists:', error);
      return false;
    }
  }
};
