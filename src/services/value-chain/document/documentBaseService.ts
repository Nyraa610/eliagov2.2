
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

/**
 * Base service for document-related operations
 */
export const documentBaseService = {
  /**
   * Ensure the document storage bucket exists
   * @returns Promise<boolean> indicating if the bucket exists or was created successfully
   */
  async ensureDocumentBucketExists(): Promise<boolean> {
    try {
      const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
      if (bucketsError) throw bucketsError;
      
      const bucketExists = buckets?.some(b => b.name === 'value_chain_documents');
      if (!bucketExists) {
        // If creating through the client fails due to RLS, we'll handle this on the server
        const { error: createBucketError } = await supabase.storage.createBucket('value_chain_documents', {
          public: true
        });
        
        if (createBucketError) {
          console.error("Error creating bucket:", createBucketError);
          return false;
        }
      }
      
      return true;
    } catch (error) {
      console.error("Error ensuring bucket exists:", error);
      return false;
    }
  },
  
  /**
   * Get the company ID for the current user
   * @param providedCompanyId Optional company ID to use instead of looking up
   * @returns Promise<string | null> The company ID or null if not found
   */
  async getUserCompanyId(providedCompanyId?: string): Promise<string | null> {
    try {
      // If company ID is provided, use it directly
      if (providedCompanyId) return providedCompanyId;
      
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return null;
      
      // Check if the user has a company ID in their profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('company_id')
        .eq('id', user.user.id)
        .single();
        
      return profile?.company_id || null;
    } catch (error) {
      console.error("Error getting user company ID:", error);
      return null;
    }
  }
};
