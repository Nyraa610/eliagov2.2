
import { supabase } from "@/lib/supabase";
import { AssessmentStatus, AssessmentType, AssessmentProgress } from "./types";

/**
 * Get assessment results by type
 */
export async function getAssessmentResults(assessmentType: string) {
  try {
    console.log(`Fetching results for assessment type: ${assessmentType}`);
    
    const { data, error } = await supabase
      .from('assessment_progress')
      .select('form_data')
      .eq('assessment_type', assessmentType)
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle(); // Using maybeSingle instead of single to avoid errors if no data exists
    
    if (error) {
      console.error("Error fetching assessment results:", error);
      return null;
    }
    
    console.log("Assessment results data:", data?.form_data);
    return data?.form_data || null;
  } catch (error) {
    console.error("Failed to get assessment results:", error);
    return null;
  }
}

/**
 * Get assessment progress
 */
export async function getAssessmentProgress(assessmentType: AssessmentType): Promise<AssessmentProgress | null> {
  try {
    const { data, error } = await supabase
      .from('assessment_progress')
      .select('status, progress, form_data')
      .eq('assessment_type', assessmentType)
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle(); // Using maybeSingle instead of single
    
    if (error) {
      console.error("Error fetching assessment progress:", error);
      return { status: 'not-started', progress: 0 };
    }
    
    return data as AssessmentProgress || { status: 'not-started', progress: 0 };
  } catch (error) {
    console.error("Failed to get assessment progress:", error);
    return { status: 'not-started', progress: 0 };
  }
}

/**
 * Save assessment progress
 */
export async function saveAssessmentProgress(
  assessmentType: string, 
  status: AssessmentStatus, 
  progress: number, 
  form_data?: any
): Promise<boolean> {
  try {
    console.log(`Saving progress for ${assessmentType}:`, { status, progress, form_data });
    
    // Get user ID from session
    const { data: session } = await supabase.auth.getSession();
    if (!session?.session?.user?.id) {
      console.error("No authenticated user found");
      return false;
    }

    const userId = session.session.user.id;
    
    const { error } = await supabase
      .from('assessment_progress')
      .upsert({
        user_id: userId,
        assessment_type: assessmentType,
        status,
        progress,
        form_data,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id, assessment_type'
      });

    if (error) {
      console.error("Error saving assessment progress:", error);
      return false;
    }
    
    console.log(`Successfully saved progress for ${assessmentType}`);
    return true;
  } catch (error) {
    console.error("Failed to save assessment progress:", error);
    return false;
  }
}
