
import { supabaseService } from "./base/supabaseService";
import { UserEnrollment } from "@/types/training";
import { trainingService } from "./trainingService";

const { supabase } = supabaseService;

export const enrollmentService = {
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
        throw error;
      }
      
      return data || null;
    } catch (error) {
      console.error("Error fetching enrollment by course id:", error);
      return null;
    }
  },
  
  async updateCourseProgress(courseId: string, progressPercentage: number): Promise<UserEnrollment> {
    try {
      const user = supabase.auth.getUser();
      const userId = (await user).data.user?.id;
      
      if (!userId) {
        throw new Error("User not authenticated");
      }
      
      const { data, error } = await supabase
        .from('user_enrollments')
        .update({ progress_percentage: progressPercentage })
        .eq('user_id', userId)
        .eq('course_id', courseId)
        .select()
        .single();
      
      if (error) throw error;
      return data as UserEnrollment;
    } catch (error) {
      console.error("Error updating course progress:", error);
      throw error;
    }
  }
};
