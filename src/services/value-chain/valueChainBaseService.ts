
import { supabase } from "@/lib/supabase";
import { ValueChainData } from "@/types/valueChain";
import { toast } from "sonner";

/**
 * Service for CRUD operations on value chain data
 */
export const valueChainBaseService = {
  /**
   * Save value chain data to Supabase
   * @param valueChain The value chain data to save
   * @returns Promise<boolean> indicating success or failure
   */
  saveValueChain: async (valueChain: ValueChainData): Promise<boolean> => {
    try {
      // Check if an entry already exists for this company
      const { data: existingData, error: fetchError } = await supabase
        .from('value_chains')
        .select('id')
        .eq('company_id', valueChain.companyId)
        .limit(1);
      
      if (fetchError) throw fetchError;
      
      const valueChainData = {
        company_id: valueChain.companyId,
        name: valueChain.name,
        data: {
          nodes: valueChain.nodes,
          edges: valueChain.edges,
          metadata: valueChain.metadata || {}
        },
        updated_at: new Date().toISOString()
      };
      
      let result;
      
      if (existingData?.length) {
        // Update existing value chain
        result = await supabase
          .from('value_chains')
          .update(valueChainData)
          .eq('company_id', valueChain.companyId);
      } else {
        // Insert new value chain
        result = await supabase
          .from('value_chains')
          .insert({
            ...valueChainData,
            created_at: new Date().toISOString()
          });
      }
      
      if (result.error) throw result.error;
      
      return true;
    } catch (error) {
      console.error("Error saving value chain:", error);
      return false;
    }
  },
  
  /**
   * Load value chain data from Supabase
   * @param companyId The company ID to load value chain for
   * @returns Promise<ValueChainData | null>
   */
  loadValueChain: async (companyId: string): Promise<ValueChainData | null> => {
    try {
      const { data, error } = await supabase
        .from('value_chains')
        .select('*')
        .eq('company_id', companyId)
        .limit(1)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') {
          // No records found, not an error
          return null;
        }
        throw error;
      }
      
      if (!data) return null;
      
      // Convert from database format to our app format
      return {
        nodes: data.data.nodes || [],
        edges: data.data.edges || [],
        name: data.name,
        companyId: data.company_id,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        metadata: data.data.metadata || {}
      };
    } catch (error) {
      console.error("Error loading value chain:", error);
      toast.error("Failed to load value chain data");
      return null;
    }
  }
};
