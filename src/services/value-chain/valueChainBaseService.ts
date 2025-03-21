
import { supabase } from "@/lib/supabase";
import { ValueChainData, ValueChainVersion } from "@/types/valueChain";
import { toast } from "sonner";

/**
 * Service for CRUD operations on value chain data
 */
export const valueChainBaseService = {
  /**
   * Save value chain data to Supabase as a new version
   * @param valueChain The value chain data to save
   * @returns Promise<boolean> indicating success or failure
   */
  saveValueChain: async (valueChain: ValueChainData): Promise<boolean> => {
    try {
      if (!valueChain.companyId) {
        console.error("Cannot save value chain: No company ID provided");
        return false;
      }

      // First, get the current version number for this company's value chains
      const { data: versionData, error: versionError } = await supabase
        .from('value_chains')
        .select('version')
        .eq('company_id', valueChain.companyId)
        .order('version', { ascending: false })
        .limit(1);
      
      if (versionError) throw versionError;
      
      const newVersion = versionData?.length ? (versionData[0].version + 1) : 1;
      
      // If this is a new version, mark all existing versions as non-current
      if (newVersion > 1) {
        const { error: updateError } = await supabase
          .from('value_chains')
          .update({ is_current: false })
          .eq('company_id', valueChain.companyId);
        
        if (updateError) throw updateError;
      }
      
      // Insert new version
      const { error: insertError } = await supabase
        .from('value_chains')
        .insert({
          company_id: valueChain.companyId,
          name: valueChain.name || `Value Chain v${newVersion}`,
          data: {
            nodes: valueChain.nodes,
            edges: valueChain.edges,
            metadata: valueChain.metadata || {}
          },
          version: newVersion,
          is_current: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      
      if (insertError) throw insertError;
      
      return true;
    } catch (error) {
      console.error("Error saving value chain version:", error);
      return false;
    }
  },
  
  /**
   * Load the current value chain data from Supabase
   * @param companyId The company ID to load value chain for
   * @returns Promise<ValueChainData | null>
   */
  loadValueChain: async (companyId: string): Promise<ValueChainData | null> => {
    try {
      const { data, error } = await supabase
        .from('value_chains')
        .select('*')
        .eq('company_id', companyId)
        .eq('is_current', true)
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
        metadata: data.data.metadata || {},
        version: data.version
      };
    } catch (error) {
      console.error("Error loading value chain:", error);
      toast.error("Failed to load value chain data");
      return null;
    }
  },
  
  /**
   * Load a specific version of a value chain
   * @param companyId The company ID
   * @param versionId The version ID to load
   * @returns Promise<ValueChainData | null>
   */
  loadValueChainVersion: async (companyId: string, versionId: string): Promise<ValueChainData | null> => {
    try {
      const { data, error } = await supabase
        .from('value_chains')
        .select('*')
        .eq('company_id', companyId)
        .eq('id', versionId)
        .limit(1)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') {
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
        metadata: data.data.metadata || {},
        version: data.version,
        id: data.id
      };
    } catch (error) {
      console.error("Error loading value chain version:", error);
      toast.error("Failed to load value chain version");
      return null;
    }
  },
  
  /**
   * Get all versions of value chains for a company
   * @param companyId The company ID
   * @returns Promise<ValueChainVersion[]>
   */
  getValueChainVersions: async (companyId: string): Promise<ValueChainVersion[]> => {
    try {
      const { data, error } = await supabase
        .from('value_chains')
        .select('id, name, version, is_current, created_at, updated_at')
        .eq('company_id', companyId)
        .order('version', { ascending: false });
      
      if (error) throw error;
      
      return data.map(version => ({
        id: version.id,
        name: version.name,
        version: version.version,
        isCurrent: version.is_current,
        createdAt: version.created_at,
        updatedAt: version.updated_at
      })) || [];
    } catch (error) {
      console.error("Error loading value chain versions:", error);
      toast.error("Failed to load value chain versions");
      return [];
    }
  },
  
  /**
   * Set a specific version as the current version
   * @param companyId The company ID
   * @param versionId The version ID to set as current
   * @returns Promise<boolean> indicating success or failure
   */
  setCurrentVersion: async (companyId: string, versionId: string): Promise<boolean> => {
    try {
      // First, mark all versions as non-current
      const { error: updateError1 } = await supabase
        .from('value_chains')
        .update({ is_current: false })
        .eq('company_id', companyId);
      
      if (updateError1) throw updateError1;
      
      // Then, mark the selected version as current
      const { error: updateError2 } = await supabase
        .from('value_chains')
        .update({ is_current: true })
        .eq('id', versionId);
      
      if (updateError2) throw updateError2;
      
      return true;
    } catch (error) {
      console.error("Error setting current version:", error);
      toast.error("Failed to set current version");
      return false;
    }
  }
};
