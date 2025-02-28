
import { supabaseService } from "./base/supabaseService";
import { ContentItem, ContentCompletion } from "@/types/training";

const { supabase } = supabaseService;

export const contentService = {
  async getContentItemsByModuleId(moduleId: string): Promise<ContentItem[]> {
    const { data, error } = await supabase
      .from('content_items')
      .select('*')
      .eq('module_id', moduleId)
      .order('sequence_order');
    
    if (error) throw error;
    return data as ContentItem[];
  },

  async markContentAsCompleted(contentItemId: string, quizScore?: number): Promise<ContentCompletion> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error("User not authenticated");

    const { data, error } = await supabase
      .from('content_completions')
      .upsert([{ 
        user_id: user.user.id, 
        content_item_id: contentItemId,
        is_completed: true,
        quiz_score: quizScore,
        completed_at: new Date().toISOString()
      }])
      .select()
      .single();
    
    if (error) throw error;
    return data as ContentCompletion;
  },

  async getCompletedContentItems(): Promise<ContentCompletion[]> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error("User not authenticated");

    const { data, error } = await supabase
      .from('content_completions')
      .select('*')
      .eq('user_id', user.user.id)
      .eq('is_completed', true);
    
    if (error) throw error;
    return data as ContentCompletion[];
  }
};
