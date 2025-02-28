
import { supabase } from "@/lib/supabase";

export const supabaseService = {
  supabase
};

export const useSupabase = () => {
  return supabase;
};
