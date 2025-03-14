
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Initialize Supabase client for database operations
const supabaseClient = createClient(
  Deno.env.get("SUPABASE_URL") as string,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") as string
);

// Save ESG assessment data to the database
export async function saveESGAssessment(userId: string, content: string, result: string) {
  try {
    const { data, error } = await supabaseClient
      .from('assessment_progress')
      .insert({
        user_id: userId,
        assessment_type: 'esg_diagnostic',
        status: 'completed',
        progress: 100,
        form_data: { 
          content, 
          analysis_result: result,
          completed_at: new Date().toISOString()
        }
      });

    if (error) {
      console.error("Error saving ESG assessment:", error);
    }

    return data;
  } catch (err) {
    console.error("Exception saving ESG assessment:", err);
    return null;
  }
}
