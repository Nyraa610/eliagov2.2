
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

// Create a Supabase client for database operations
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const adminSupabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * Save ESG assessment data to the database
 */
export async function saveESGAssessment(userId: string, input: string, result: string): Promise<boolean> {
  try {
    const { error } = await adminSupabase
      .from('esg_assessments')
      .insert({
        user_id: userId,
        input_text: input,
        result_text: result,
      });
    
    if (error) {
      console.error('Error saving ESG assessment:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Exception in saveESGAssessment:', error);
    return false;
  }
}

/**
 * Save chat history to the database
 */
export async function saveChatHistory(userId: string, userMessage: string, assistantResponse: string): Promise<boolean> {
  try {
    const { error } = await adminSupabase
      .from('chat_history')
      .insert({
        user_id: userId,
        user_message: userMessage,
        assistant_response: assistantResponse,
        tag: 'esg' // Default tag for ESG-related chats
      });
    
    if (error) {
      console.error('Error saving chat history:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Exception in saveChatHistory:', error);
    return false;
  }
}
