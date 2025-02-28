
import { supabaseService } from "./base/supabaseService";
import { Module, ModuleCompletion } from "@/types/training";

const { supabase } = supabaseService;

export const moduleService = {
  async getModulesByCourseId(courseId: string): Promise<Module[]> {
    const { data, error } = await supabase
      .from('modules')
      .select('*')
      .eq('course_id', courseId)
      .order('sequence_order');
    
    if (error) throw error;
    return data as Module[];
  },

  async markModuleAsCompleted(moduleId: string): Promise<ModuleCompletion> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error("User not authenticated");

    const { data, error } = await supabase
      .from('module_completions')
      .upsert([{ 
        user_id: user.user.id, 
        module_id: moduleId,
        is_completed: true,
        completed_at: new Date().toISOString()
      }])
      .select()
      .single();
    
    if (error) throw error;
    return data as ModuleCompletion;
  },

  async getCompletedModules(): Promise<ModuleCompletion[]> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error("User not authenticated");

    const { data, error } = await supabase
      .from('module_completions')
      .select('*')
      .eq('user_id', user.user.id)
      .eq('is_completed', true);
    
    if (error) throw error;
    return data as ModuleCompletion[];
  }
};
