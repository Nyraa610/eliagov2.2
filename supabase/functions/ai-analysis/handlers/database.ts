
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

function createSupabaseClient() {
  const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
  const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY") || "";
  return createClient(supabaseUrl, supabaseKey);
}

/**
 * Save the ESG assessment data to the database
 */
export async function saveESGAssessment(userId: string, content: string, result: string) {
  try {
    console.log(`Saving ESG assessment for user ${userId.substring(0, 8)}...`);
    const supabase = createSupabaseClient();
    
    const { data, error } = await supabase
      .from('esg_assessments')
      .insert({
        user_id: userId,
        content: content,
        result: result,
        created_at: new Date().toISOString()
      });
    
    if (error) {
      console.error("Error saving ESG assessment:", error);
      console.error("Error details:", JSON.stringify(error, null, 2));
      throw error;
    }
    
    console.log("ESG assessment saved successfully");
    return true;
  } catch (error) {
    console.error("Error in saveESGAssessment:", error);
    console.error("Error stack:", error.stack);
    return false;
  }
}

/**
 * Save the chat history to the database
 */
export async function saveChatHistory(userId: string, message: string, response: string) {
  try {
    console.log(`Saving chat history for user ${userId.substring(0, 8)}...`);
    const supabase = createSupabaseClient();
    
    const { error } = await supabase
      .from('chat_history')
      .insert({
        user_id: userId,
        user_message: message,
        assistant_response: response,
        created_at: new Date().toISOString()
      });
    
    if (error) {
      console.error("Error saving chat history:", error);
      console.error("Error details:", JSON.stringify(error, null, 2));
      throw error;
    }
    
    console.log("Chat history saved successfully");
    return true;
  } catch (error) {
    console.error("Error in saveChatHistory:", error);
    console.error("Error stack:", error.stack);
    return false;
  }
}
