
import { supabaseService } from "./base/supabaseService";
import { Course, UserEnrollment } from "@/types/training";

const { supabase } = supabaseService;

export const courseService = {
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

  async enrollUserInCourse(courseId: string): Promise<UserEnrollment> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error("User not authenticated");

    // Check if user is already enrolled
    const { data: existingEnrollment } = await supabase
      .from('user_enrollments')
      .select('*')
      .eq('user_id', user.user.id)
      .eq('course_id', courseId)
      .single();
    
    if (existingEnrollment) return existingEnrollment as UserEnrollment;

    // Create new enrollment
    const { data, error } = await supabase
      .from('user_enrollments')
      .insert([{ user_id: user.user.id, course_id: courseId }])
      .select()
      .single();
    
    if (error) throw error;
    return data as UserEnrollment;
  },

  async getUserEnrollments(): Promise<UserEnrollment[]> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error("User not authenticated");

    const { data, error } = await supabase
      .from('user_enrollments')
      .select('*')
      .eq('user_id', user.user.id);
    
    if (error) throw error;
    return data as UserEnrollment[];
  },

  async getEnrollmentByCourseId(courseId: string): Promise<UserEnrollment | null> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error("User not authenticated");

    const { data, error } = await supabase
      .from('user_enrollments')
      .select('*')
      .eq('user_id', user.user.id)
      .eq('course_id', courseId)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "row not found"
    return data as UserEnrollment | null;
  }
};
