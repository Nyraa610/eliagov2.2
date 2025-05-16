
import { createClient } from '@supabase/supabase-js';

// Use environment variables or default to empty strings if not available
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Auth listener setup function
export const setupAuthListener = (callback: (isAuthenticated: boolean) => void) => {
  const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
    const isAuthenticated = session !== null;
    callback(isAuthenticated);
  });

  // Also check current session
  supabase.auth.getSession().then(({ data: { session } }) => {
    const isAuthenticated = session !== null;
    callback(isAuthenticated);
  });

  return { subscription };
};
