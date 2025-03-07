
import { supabase } from "@/lib/supabase";

// Export the supabase instance for direct access when needed
export const supabaseClient = supabase;

// Provide a hook for components that need direct access to supabase instance
export const useSupabase = () => {
  return supabase;
};
