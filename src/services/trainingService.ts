
import { supabase } from "@/lib/supabase";
import { 
  Course, 
  Module, 
  ContentItem, 
  QuizQuestion, 
  QuizAnswer, 
  UserEnrollment,
  ModuleCompletion,
  ContentCompletion,
  Certificate
} from "@/types/training";

export const trainingService = {
  // Courses
  async getCourses(): Promise<Course[]> {
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .order('title');
    
    if (error) throw error;
    return data as Course[];
  },

  async getCourseById(id: string): Promise<Course> {
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data as Course;
  },

  // Modules
  async getModulesByCourseId(courseId: string): Promise<Module[]> {
    const { data, error } = await supabase
      .from('modules')
      .select('*')
      .eq('course_id', courseId)
      .order('sequence_order');
    
    if (error) throw error;
    return data as Module[];
  },

  // Content Items
  async getContentItemsByModuleId(moduleId: string): Promise<ContentItem[]> {
    const { data, error } = await supabase
      .from('content_items')
      .select('*')
      .eq('module_id', moduleId)
      .order('sequence_order');
    
    if (error) throw error;
    return data as ContentItem[];
  },

  // Quiz Questions & Answers
  async getQuizQuestionsByContentItemId(contentItemId: string): Promise<QuizQuestion[]> {
    const { data, error } = await supabase
      .from('quiz_questions')
      .select('*')
      .eq('content_item_id', contentItemId)
      .order('sequence_order');
    
    if (error) throw error;
    return data as QuizQuestion[];
  },

  async getQuizAnswersByQuestionId(questionId: string): Promise<QuizAnswer[]> {
    const { data, error } = await supabase
      .from('quiz_answers')
      .select('*')
      .eq('question_id', questionId)
      .order('sequence_order');
    
    if (error) throw error;
    return data as QuizAnswer[];
  },

  // User Enrollments
  async enrollUserInCourse(courseId: string): Promise<UserEnrollment> {
    const { data: user } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    // Check if user is already enrolled
    const { data: existingEnrollment } = await supabase
      .from('user_enrollments')
      .select('*')
      .eq('user_id', user.user?.id)
      .eq('course_id', courseId)
      .single();
    
    if (existingEnrollment) return existingEnrollment as UserEnrollment;

    // Create new enrollment
    const { data, error } = await supabase
      .from('user_enrollments')
      .insert([{ user_id: user.user?.id, course_id: courseId }])
      .select()
      .single();
    
    if (error) throw error;
    return data as UserEnrollment;
  },

  async getUserEnrollments(): Promise<UserEnrollment[]> {
    const { data: user } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const { data, error } = await supabase
      .from('user_enrollments')
      .select('*')
      .eq('user_id', user.user?.id);
    
    if (error) throw error;
    return data as UserEnrollment[];
  },

  async getEnrollmentByCourseId(courseId: string): Promise<UserEnrollment | null> {
    const { data: user } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const { data, error } = await supabase
      .from('user_enrollments')
      .select('*')
      .eq('user_id', user.user?.id)
      .eq('course_id', courseId)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "row not found"
    return data as UserEnrollment | null;
  },

  // Module & Content Completions
  async markModuleAsCompleted(moduleId: string): Promise<ModuleCompletion> {
    const { data: user } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const { data, error } = await supabase
      .from('module_completions')
      .upsert([{ 
        user_id: user.user?.id, 
        module_id: moduleId,
        is_completed: true,
        completed_at: new Date().toISOString()
      }])
      .select()
      .single();
    
    if (error) throw error;
    return data as ModuleCompletion;
  },

  async markContentAsCompleted(contentItemId: string, quizScore?: number): Promise<ContentCompletion> {
    const { data: user } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const { data, error } = await supabase
      .from('content_completions')
      .upsert([{ 
        user_id: user.user?.id, 
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

  async getCompletedModules(): Promise<ModuleCompletion[]> {
    const { data: user } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const { data, error } = await supabase
      .from('module_completions')
      .select('*')
      .eq('user_id', user.user?.id)
      .eq('is_completed', true);
    
    if (error) throw error;
    return data as ModuleCompletion[];
  },

  async getCompletedContentItems(): Promise<ContentCompletion[]> {
    const { data: user } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const { data, error } = await supabase
      .from('content_completions')
      .select('*')
      .eq('user_id', user.user?.id)
      .eq('is_completed', true);
    
    if (error) throw error;
    return data as ContentCompletion[];
  },

  // Certificates
  async getUserCertificates(): Promise<Certificate[]> {
    const { data: user } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const { data, error } = await supabase
      .from('certificates')
      .select('*')
      .eq('user_id', user.user?.id);
    
    if (error) throw error;
    return data as Certificate[];
  },

  // Upload functions for training materials
  async uploadVideo(file: File): Promise<string> {
    const { data: user } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const fileExt = file.name.split('.').pop();
    const fileName = `${user.user?.id}/${Date.now()}.${fileExt}`;
    const filePath = `videos/${fileName}`;

    const { error } = await supabase.storage
      .from('training_materials')
      .upload(filePath, file);
    
    if (error) throw error;

    const { data } = supabase.storage
      .from('training_materials')
      .getPublicUrl(filePath);

    return data.publicUrl;
  },

  async uploadImage(file: File): Promise<string> {
    const { data: user } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const fileExt = file.name.split('.').pop();
    const fileName = `${user.user?.id}/${Date.now()}.${fileExt}`;
    const filePath = `images/${fileName}`;

    const { error } = await supabase.storage
      .from('training_materials')
      .upload(filePath, file);
    
    if (error) throw error;

    const { data } = supabase.storage
      .from('training_materials')
      .getPublicUrl(filePath);

    return data.publicUrl;
  }
};
