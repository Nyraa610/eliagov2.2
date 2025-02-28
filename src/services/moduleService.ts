
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

  async getModuleById(moduleId: string): Promise<Module> {
    const { data, error } = await supabase
      .from('modules')
      .select('*')
      .eq('id', moduleId)
      .single();
    
    if (error) throw error;
    return data as Module;
  },

  async createModule(moduleData: Partial<Module>): Promise<Module> {
    const { data, error } = await supabase
      .from('modules')
      .insert([moduleData])
      .select()
      .single();
    
    if (error) throw error;
    return data as Module;
  },

  async updateModule(moduleId: string, moduleData: Partial<Module>): Promise<Module> {
    const { data, error } = await supabase
      .from('modules')
      .update(moduleData)
      .eq('id', moduleId)
      .select()
      .single();
    
    if (error) throw error;
    return data as Module;
  },

  async deleteModule(moduleId: string): Promise<void> {
    const { error } = await supabase
      .from('modules')
      .delete()
      .eq('id', moduleId);
    
    if (error) throw error;
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
