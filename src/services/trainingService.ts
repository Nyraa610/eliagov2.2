
import { supabaseService } from "./base/supabaseService";
import { 
  Course, 
  Module, 
  ContentItem, 
  UserEnrollment, 
  ContentCompletion, 
  ModuleCompletion,
  QuizQuestion,
  QuizAnswer,
  Certificate
} from "@/types/training";
import { contentCompletionService } from "./contentCompletionService";

const { supabase } = supabaseService;

export const trainingService = {
  // Course methods
  async getCourses(): Promise<Course[]> {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .order('title', { ascending: true });
        
      if (error) throw error;
      return data as Course[];
    } catch (error) {
      console.error("Error fetching courses:", error);
      throw error;
    }
  },
  
  async getCourseById(id: string): Promise<Course> {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('id', id)
        .single();
        
      if (error) throw error;
      return data as Course;
    } catch (error) {
      console.error(`Error fetching course with id ${id}:`, error);
      throw error;
    }
  },
  
  // Enrollment methods
  async enrollUserInCourse(courseId: string): Promise<UserEnrollment> {
    try {
      const user = supabase.auth.getUser();
      const userId = (await user).data.user?.id;
      
      if (!userId) {
        throw new Error("User not authenticated");
      }
      
      const data = {
        user_id: userId,
        course_id: courseId,
        started_at: new Date().toISOString(),
        is_completed: false,
        progress_percentage: 0,
        points_earned: 0
      };
      
      const { data: result, error } = await supabase
        .from('user_enrollments')
        .upsert(data)
        .select()
        .single();
      
      if (error) throw error;
      return result as UserEnrollment;
    } catch (error) {
      console.error("Error enrolling user in course:", error);
      throw error;
    }
  },
  
  async getUserEnrollments(): Promise<UserEnrollment[]> {
    try {
      const user = supabase.auth.getUser();
      const userId = (await user).data.user?.id;
      
      if (!userId) {
        return [];
      }
      
      const { data, error } = await supabase
        .from('user_enrollments')
        .select('*, courses(*)')
        .eq('user_id', userId);
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error fetching user enrollments:", error);
      return [];
    }
  },
  
  async getEnrollmentByCourseId(courseId: string): Promise<UserEnrollment | null> {
    try {
      const user = supabase.auth.getUser();
      const userId = (await user).data.user?.id;
      
      if (!userId) {
        return null;
      }
      
      const { data, error } = await supabase
        .from('user_enrollments')
        .select('*')
        .eq('user_id', userId)
        .eq('course_id', courseId)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        // PGRST116 is "No rows returned" which we handle as null
        throw error;
      }
      
      return data || null;
    } catch (error) {
      console.error("Error fetching enrollment by course id:", error);
      return null;
    }
  },
  
  // Module methods
  async getModulesByCourseId(courseId: string): Promise<Module[]> {
    try {
      const { data, error } = await supabase
        .from('modules')
        .select('*')
        .eq('course_id', courseId)
        .order('sequence_order', { ascending: true });
        
      if (error) throw error;
      return data as Module[];
    } catch (error) {
      console.error(`Error fetching modules for course ${courseId}:`, error);
      throw error;
    }
  },
  
  async markModuleAsCompleted(moduleId: string): Promise<ModuleCompletion> {
    try {
      const user = supabase.auth.getUser();
      const userId = (await user).data.user?.id;
      
      if (!userId) {
        throw new Error("User not authenticated");
      }
      
      const data = {
        user_id: userId,
        module_id: moduleId,
        is_completed: true,
        completed_at: new Date().toISOString()
      };
      
      const { data: result, error } = await supabase
        .from('module_completions')
        .upsert(data)
        .select()
        .single();
      
      if (error) throw error;
      return result as ModuleCompletion;
    } catch (error) {
      console.error("Error marking module as completed:", error);
      throw error;
    }
  },
  
  async getCompletedModules(): Promise<ModuleCompletion[]> {
    try {
      const user = supabase.auth.getUser();
      const userId = (await user).data.user?.id;
      
      if (!userId) {
        return [];
      }
      
      const { data, error } = await supabase
        .from('module_completions')
        .select('*')
        .eq('user_id', userId)
        .eq('is_completed', true);
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error fetching completed modules:", error);
      return [];
    }
  },
  
  // Content methods
  async getContentItemsByModuleId(moduleId: string): Promise<ContentItem[]> {
    try {
      const { data, error } = await supabase
        .from('content_items')
        .select('*')
        .eq('module_id', moduleId)
        .order('sequence_order', { ascending: true });
        
      if (error) throw error;
      return data as ContentItem[];
    } catch (error) {
      console.error(`Error fetching content items for module ${moduleId}:`, error);
      throw error;
    }
  },
  
  async markContentAsCompleted(contentItemId: string, quizScore?: number): Promise<ContentCompletion> {
    return contentCompletionService.markContentAsCompleted(contentItemId, quizScore);
  },
  
  async getCompletedContentItems(): Promise<ContentCompletion[]> {
    return contentCompletionService.getCompletedContentItems();
  },
  
  // Quiz methods
  async getQuizQuestionsByContentItemId(contentItemId: string): Promise<QuizQuestion[]> {
    try {
      const { data, error } = await supabase
        .from('quiz_questions')
        .select('*')
        .eq('content_item_id', contentItemId)
        .order('sequence_order', { ascending: true });
        
      if (error) throw error;
      return data as QuizQuestion[];
    } catch (error) {
      console.error(`Error fetching quiz questions for content ${contentItemId}:`, error);
      throw error;
    }
  },
  
  async getQuizAnswersByQuestionId(questionId: string): Promise<QuizAnswer[]> {
    try {
      const { data, error } = await supabase
        .from('quiz_answers')
        .select('*')
        .eq('question_id', questionId)
        .order('sequence_order', { ascending: true });
        
      if (error) throw error;
      return data as QuizAnswer[];
    } catch (error) {
      console.error(`Error fetching quiz answers for question ${questionId}:`, error);
      throw error;
    }
  },
  
  // Certificate methods
  async getCertificates(): Promise<Certificate[]> {
    try {
      const user = supabase.auth.getUser();
      const userId = (await user).data.user?.id;
      
      if (!userId) {
        return [];
      }
      
      const { data, error } = await supabase
        .from('certificates')
        .select('*, courses(*)')
        .eq('user_id', userId);
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error fetching certificates:", error);
      return [];
    }
  }
};
