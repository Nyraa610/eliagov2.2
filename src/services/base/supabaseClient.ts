
import { supabase } from "@/lib/supabase";

// Export the supabase instance for direct access when needed
export const supabaseClient = supabase;

// Provide a hook for components that need direct access to supabase instance
export const useSupabase = () => {
  return supabase;
};

// Add a convenience method for getting the current user
export const getCurrentUser = async () => {
  try {
    const { data, error } = await supabase.auth.getUser();
    
    if (error) {
      console.error("Error getting current user:", error.message);
      return null;
    }
    
    return data.user;
  } catch (error) {
    console.error("Exception getting current user:", error);
    return null;
  }
};

// Add a convenience method for executing custom SQL queries
export const executeCustomQuery = async (queryText: string, params: any[] = []) => {
  try {
    const { data, error } = await supabaseClient.rpc('execute_sql', { 
      query_text: queryText,
      ...params.reduce((acc, param, index) => {
        acc[`param${index + 1}`] = param;
        return acc;
      }, {} as Record<string, any>)
    });
    
    return { data, error };
  } catch (error) {
    console.error("Error executing custom query:", error);
    return { data: null, error };
  }
};
