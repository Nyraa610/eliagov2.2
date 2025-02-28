
import { supabaseService } from "./base/supabaseService";
import { ContentItem } from "@/types/training";

const { supabase } = supabaseService;

export const contentService = {
  async getContentItemsByModuleId(moduleId: string): Promise<ContentItem[]> {
    try {
      const { data, error } = await supabase
        .from('content_items')
        .select('*')
        .eq('module_id', moduleId)
        .order('sequence_order');
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error fetching content items:", error);
      return [];
    }
  },

  async getContentItemById(id: string): Promise<ContentItem | null> {
    try {
      const { data, error } = await supabase
        .from('content_items')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error fetching content item:", error);
      return null;
    }
  },

  async createContentItem(contentItem: Partial<ContentItem>): Promise<ContentItem> {
    const { data, error } = await supabase
      .from('content_items')
      .insert([contentItem])
      .select()
      .single();
    
    if (error) throw error;
    return data as ContentItem;
  },

  async updateContentItem(id: string, updates: Partial<ContentItem>): Promise<ContentItem> {
    const { data, error } = await supabase
      .from('content_items')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data as ContentItem;
  },

  async deleteContentItem(id: string): Promise<void> {
    const { error } = await supabase
      .from('content_items')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  async reorderContentItems(items: { id: string, sequence_order: number }[]): Promise<void> {
    // Perform updates in a transaction if possible
    for (const item of items) {
      const { error } = await supabase
        .from('content_items')
        .update({ sequence_order: item.sequence_order })
        .eq('id', item.id);
      
      if (error) throw error;
    }
  }
};
