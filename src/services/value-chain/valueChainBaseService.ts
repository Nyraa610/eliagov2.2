
import { supabase } from "@/lib/supabase";
import { ValueChainData } from "@/types/valueChain";
import { toast } from "sonner";

/**
 * Base service for value chain data operations
 */
export const valueChainBaseService = {
  /**
   * Save value chain data
   */
  saveValueChain: async (data: ValueChainData): Promise<boolean> => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        console.log("No authenticated user session found");
        toast.error("You need to be logged in to save value chain data");
        return false;
      }
      
      const userId = session.user.id;
      
      // Check if there's an existing record for this company
      const { data: existingRecord } = await supabase
        .from('value_chains')
        .select('id')
        .eq('company_id', data.companyId)
        .maybeSingle();
      
      const payload = {
        user_id: userId,
        company_id: data.companyId,
        name: data.name || 'Value Chain Model',
        data: {
          nodes: data.nodes,
          edges: data.edges
        },
        updated_at: new Date().toISOString()
      };
      
      let result;
      
      if (existingRecord?.id) {
        // Update existing record
        result = await supabase
          .from('value_chains')
          .update(payload)
          .eq('id', existingRecord.id);
      } else {
        // Insert new record
        result = await supabase
          .from('value_chains')
          .insert([payload]);
      }
      
      if (result.error) {
        console.error("Error saving value chain:", result.error.message);
        toast.error("Failed to save value chain");
        return false;
      }
      
      console.log(`Value chain saved for company ${data.companyId}`);
      return true;
    } catch (error) {
      console.error("Exception saving value chain:", error);
      toast.error("An error occurred while saving value chain");
      return false;
    }
  },

  /**
   * Load value chain data for a company
   */
  loadValueChain: async (companyId: string): Promise<ValueChainData | null> => {
    try {
      const { data, error } = await supabase
        .from('value_chains')
        .select('*')
        .eq('company_id', companyId)
        .maybeSingle();
      
      if (error) {
        console.error("Error loading value chain:", error.message);
        return null;
      }
      
      if (!data) {
        return null;
      }
      
      return {
        nodes: data.data.nodes,
        edges: data.data.edges,
        name: data.name,
        companyId: data.company_id,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };
    } catch (error) {
      console.error("Exception loading value chain:", error);
      return null;
    }
  }
};
