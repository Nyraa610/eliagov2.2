
import { supabase } from "@/lib/supabase";
import { FeatureStatus } from "@/types/training";
import { toast } from "sonner";

export type AssessmentType = 'rse_diagnostic' | 'carbon_evaluation' | 'materiality_analysis' | 'action_plan' | 'value_chain' | 'iro_analysis';

interface AssessmentProgress {
  id?: string;
  user_id?: string;
  assessment_type: AssessmentType;
  status: FeatureStatus;
  progress: number;
  form_data?: any;
  created_at?: string;
  updated_at?: string;
}

export const assessmentService = {
  /**
   * Get the assessment progress for a specific assessment type
   */
  getAssessmentProgress: async (assessmentType: AssessmentType): Promise<AssessmentProgress | null> => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        console.log("No authenticated user session found");
        return null;
      }
      
      const { data, error } = await supabase
        .from('assessment_progress')
        .select('*')
        .eq('assessment_type', assessmentType)
        .eq('user_id', session.user.id)
        .maybeSingle();
      
      if (error) {
        console.error("Error fetching assessment progress:", error.message);
        return null;
      }
      
      return data;
    } catch (error) {
      console.error("Exception fetching assessment progress:", error);
      return null;
    }
  },
  
  /**
   * Save or update assessment progress
   */
  saveAssessmentProgress: async (
    assessmentType: AssessmentType,
    status: FeatureStatus,
    progress: number,
    formData?: any
  ): Promise<boolean> => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        console.log("No authenticated user session found");
        toast.error("You need to be logged in to save progress");
        return false;
      }
      
      const userId = session.user.id;
      
      // Check if there's an existing record
      const { data: existingRecord } = await supabase
        .from('assessment_progress')
        .select('id')
        .eq('assessment_type', assessmentType)
        .eq('user_id', userId)
        .maybeSingle();
      
      const payload = {
        user_id: userId,
        assessment_type: assessmentType,
        status,
        progress,
        form_data: formData,
        updated_at: new Date().toISOString()
      };
      
      let result;
      
      if (existingRecord?.id) {
        // Update existing record
        result = await supabase
          .from('assessment_progress')
          .update(payload)
          .eq('id', existingRecord.id);
      } else {
        // Insert new record
        result = await supabase
          .from('assessment_progress')
          .insert([payload]);
      }
      
      if (result.error) {
        console.error("Error saving assessment progress:", result.error.message);
        toast.error("Failed to save progress");
        return false;
      }
      
      console.log(`Assessment progress saved for ${assessmentType}`);
      return true;
    } catch (error) {
      console.error("Exception saving assessment progress:", error);
      toast.error("An error occurred while saving progress");
      return false;
    }
  },

  /**
   * Get assessment results for a specific assessment type
   * For now, this returns the form_data from the assessment progress
   * In a real implementation, this would fetch actual processed results
   */
  getAssessmentResults: async (assessmentType: AssessmentType): Promise<any | null> => {
    try {
      const progress = await assessmentService.getAssessmentProgress(assessmentType);
      
      if (!progress) {
        console.log("No assessment progress found");
        return null;
      }
      
      // For now, we'll just return the form_data field as our results
      // In a real implementation, this would likely involve more processing
      return progress.form_data;
    } catch (error) {
      console.error(`Error fetching ${assessmentType} results:`, error);
      return null;
    }
  }
};
