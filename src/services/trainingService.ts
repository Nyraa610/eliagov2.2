
import { supabaseService } from "./base/supabaseService";
import { Course, Module, ContentItem } from "@/types/training";
import { contentCompletionService } from "./contentCompletionService";
import { quizService } from "./quizService";
import { enrollmentService } from "./enrollmentService";
import { certificateService } from "./certificateService";

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
  
  async markModuleAsCompleted(moduleId: string) {
    return contentCompletionService.markModuleAsCompleted(moduleId);
  },
  
  async getCompletedModules() {
    return contentCompletionService.getCompletedModules();
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
  
  // Delegate to other services
  async markContentAsCompleted(contentItemId: string, quizScore?: number) {
    return contentCompletionService.markContentAsCompleted(contentItemId, quizScore);
  },
  
  async getCompletedContentItems() {
    return contentCompletionService.getCompletedContentItems();
  },
  
  async getQuizQuestionsByContentItemId(contentItemId: string) {
    return quizService.getQuizQuestionsByContentItemId(contentItemId);
  },
  
  async getQuizAnswersByQuestionId(questionId: string) {
    return quizService.getQuizAnswersByQuestionId(questionId);
  },
  
  // Re-export enrollment methods
  enrollUserInCourse: enrollmentService.enrollUserInCourse,
  getUserEnrollments: enrollmentService.getUserEnrollments,
  getEnrollmentByCourseId: enrollmentService.getEnrollmentByCourseId,
  updateCourseProgress: enrollmentService.updateCourseProgress,
  
  // Re-export certificate methods
  getCertificates: certificateService.getCertificates,
  generateCertificate: certificateService.generateCertificate,
  
  // Quiz editing methods
  deleteQuizQuestion: quizService.deleteQuizQuestion,
  saveQuizQuestion: quizService.saveQuizQuestion,
  updateQuizQuestion: quizService.updateQuizQuestion,
  saveQuizAnswer: quizService.saveQuizAnswer,
  updateQuizAnswer: quizService.updateQuizAnswer,
  deleteQuizAnswer: quizService.deleteQuizAnswer
};
