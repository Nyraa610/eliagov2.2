
import { supabaseService } from "./base/supabaseService";
import { Certificate } from "@/types/training";
import { trainingService } from "./trainingService";

const { supabase } = supabaseService;

export const certificateService = {
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
      
      const { data: existingCert, error: certError } = await supabase
        .from('certificates')
        .select('*')
        .eq('user_id', userId)
        .eq('course_id', courseId)
        .single();
      
      if (existingCert) {
        return existingCert as { id: string; certificate_url: string };
      }
      
      const course = await trainingService.getCourseById(courseId);
      
      const { data: contentCompletions, error: completionsError } = await supabase
        .from('content_completions')
        .select('quiz_score')
        .eq('user_id', userId)
        .not('quiz_score', 'is', null);
      
      if (completionsError) throw completionsError;
      
      const pointsEarned = contentCompletions
        ? contentCompletions.reduce((sum, item) => sum + (item.quiz_score || 0), 0)
        : 0;
      
      const certificateUrl = `https://example.com/certificates/${courseId}-${userId}`;
      
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
