import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

function createClient() {
  const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
  const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY") || "";
  return createClient(supabaseUrl, supabaseKey);
}

/**
 * Save the ESG assessment data to the database
 */
export async function saveESGAssessment(userId: string, content: string, result: string) {
  try {
    const supabase = createClient();
    
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
      throw error;
    }
    
    console.log("ESG assessment saved successfully");
    return true;
  } catch (error) {
    console.error("Error in saveESGAssessment:", error);
    return false;
  }
}

/**
 * Save the chat history to the database
 */
export async function saveChatHistory(userId: string, message: string, response: string) {
  try {
    const supabase = createClient();
    
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
      throw error;
    }
    
    console.log("Chat history saved successfully");
    return true;
  } catch (error) {
    console.error("Error in saveChatHistory:", error);
    return false;
  }
}
