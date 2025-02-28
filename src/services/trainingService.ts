
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
import { quizService } from "./quizService";

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
    return quizService.getQuizQuestionsByContentItemId(contentItemId);
  },
  
  async getQuizAnswersByQuestionId(questionId: string): Promise<QuizAnswer[]> {
    return quizService.getQuizAnswersByQuestionId(questionId);
  },
  
  // Quiz editing methods for QuizEditor
  async deleteQuizQuestion(questionId: string): Promise<void> {
    return quizService.deleteQuizQuestion(questionId);
  },
  
  async saveQuizQuestion(question: Partial<QuizQuestion>): Promise<QuizQuestion> {
    return quizService.saveQuizQuestion(question);
  },
  
  async updateQuizQuestion(questionId: string, questionData: Partial<QuizQuestion>): Promise<QuizQuestion> {
    return quizService.updateQuizQuestion(questionId, questionData);
  },
  
  async saveQuizAnswer(answer: Partial<QuizAnswer>): Promise<QuizAnswer> {
    return quizService.saveQuizAnswer(answer);
  },
  
  async updateQuizAnswer(answerId: string, answerData: Partial<QuizAnswer>): Promise<QuizAnswer> {
    return quizService.updateQuizAnswer(answerId, answerData);
  },
  
  async deleteQuizAnswer(answerId: string): Promise<void> {
    return quizService.deleteQuizAnswer(answerId);
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
  },

  async generateCertificate(courseId: string): Promise<{ id: string; certificate_url: string }> {
    try {
      const user = supabase.auth.getUser();
      const userId = (await user).data.user?.id;
      
      if (!userId) {
        throw new Error("User not authenticated");
      }
      
      // Check if a certificate already exists
      const { data: existingCert, error: certError } = await supabase
        .from('certificates')
        .select('*')
        .eq('user_id', userId)
        .eq('course_id', courseId)
        .single();
      
      if (existingCert) {
        return existingCert as { id: string; certificate_url: string };
      }
      
      // Get course details
      const course = await this.getCourseById(courseId);
      
      // Calculate total points earned
      const { data: contentCompletions, error: completionsError } = await supabase
        .from('content_completions')
        .select('quiz_score')
        .eq('user_id', userId)
        .not('quiz_score', 'is', null);
      
      if (completionsError) throw completionsError;
      
      const pointsEarned = contentCompletions
        ? contentCompletions.reduce((sum, item) => sum + (item.quiz_score || 0), 0)
        : 0;
      
      // Generate a certificate URL (in a real app, you might generate a PDF or image)
      const certificateUrl = `https://example.com/certificates/${courseId}-${userId}`;
      
      // Save the certificate
      const { data, error } = await supabase
        .from('certificates')
        .insert({
          user_id: userId,
          course_id: courseId,
          points_earned: pointsEarned,
          certificate_url: certificateUrl,
          issued_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Update enrollment to mark course as completed
      await supabase
        .from('user_enrollments')
        .update({
          is_completed: true,
          completed_at: new Date().toISOString(),
          points_earned: pointsEarned
        })
        .eq('user_id', userId)
        .eq('course_id', courseId);
      
      return data as { id: string; certificate_url: string };
    } catch (error) {
      console.error("Error generating certificate:", error);
      throw error;
    }
  }
};
