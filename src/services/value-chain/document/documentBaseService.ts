import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

/**
 * Base service with shared document functionality
 */
export const documentBaseService = {
  /**
   * Ensure the document storage bucket exists for value chain documents
   * @returns Promise<boolean> True if the bucket exists or was created
   */
  async ensureDocumentBucketExists(): Promise<boolean> {
    try {
      // Check if the bucket exists
      const { data: buckets, error: listError } = await supabase.storage.listBuckets();
      
      if (listError) {
        console.error(`Error listing buckets:`, listError);
        return false;
      }
      
      const bucketExists = buckets.some(bucket => bucket.name === 'value_chain_documents');
      
      if (!bucketExists) {
        // Attempt to create the bucket using an edge function which has admin rights
        console.log(`Value chain documents bucket doesn't exist, creating it using edge function...`);
        
        try {
          const { error: functionError } = await supabase.functions.invoke('initialize-storage', {
            body: { bucketName: 'value_chain_documents' }
          });
          
          if (functionError) {
            console.error(`Error invoking edge function to create bucket:`, functionError);
            toast.error(`Error initializing storage. Please contact support.`);
            return false;
          }
          
          console.log(`Successfully created value_chain_documents bucket`);
          return true;
        } catch (edgeFunctionError) {
          console.error(`Error in edge function:`, edgeFunctionError);
          return false;
        }
      } else {
        console.log(`Value chain documents bucket already exists`);
        return true;
      }
    } catch (error) {
      console.error('Error ensuring document bucket exists:', error);
      return false;
    }
  },
  
  /**
   * Get the user's company ID, either from the provided parameter or the current user
   * @param companyId Optional company ID to use
   * @returns Promise<string | null> The company ID or null if not found
   */
  async getUserCompanyId(companyId?: string): Promise<string | null> {
    try {
      // If the company ID is provided, use it
      if (companyId) {
        return companyId;
      }
      
      // Otherwise, get the user's company ID from their profile
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        console.error('User not authenticated');
        return null;
      }
      
      // Get the user's profile to find their company ID
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('company_id')
        .eq('id', user.user.id)
        .single();
        
      if (profileError || !profile || !profile.company_id) {
        console.error('Error getting user company ID:', profileError || 'No company ID found');
        return null;
      }
      
      return profile.company_id;
    } catch (error) {
      console.error('Error in getUserCompanyId:', error);
      return null;
    }
  }
};
