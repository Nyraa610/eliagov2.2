
import { supabaseService } from "./base/supabaseService";
import { ContentCompletion } from "@/types/training";

const { supabase } = supabaseService;

export const contentCompletionService = {
  async markContentAsCompleted(contentItemId: string, quizScore?: number): Promise<ContentCompletion> {
    try {
      const user = supabase.auth.getUser();
      const userId = (await user).data.user?.id;
      
      if (!userId) {
        throw new Error("User not authenticated");
      }
      
      const data = {
        user_id: userId,
        content_item_id: contentItemId,
        is_completed: true,
        completed_at: new Date().toISOString(),
        quiz_score: quizScore || null
      };
      
      const { data: result, error } = await supabase
        .from('content_completions')
        .upsert(data)
        .select()
        .single();
      
      if (error) throw error;
      return result as ContentCompletion;
    } catch (error) {
      console.error("Error marking content as completed:", error);
      throw error;
    }
  },
  
  async getCompletedContentItems(): Promise<ContentCompletion[]> {
    try {
      const user = supabase.auth.getUser();
      const userId = (await user).data.user?.id;
      
      if (!userId) {
        return [];
      }
      
      const { data, error } = await supabase
        .from('content_completions')
        .select('*')
        .eq('user_id', userId)
        .eq('is_completed', true);
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error fetching completed content items:", error);
      return [];
    }
  }
};
