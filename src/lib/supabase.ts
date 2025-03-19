
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://tqvylbkavunzlckhqxcl.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRxdnlsYmthdnVuemxja2hxeGNsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAzMzM4MDksImV4cCI6MjA1NTkwOTgwOX0.2CjAxh7DpNx74ncjK9f_r8W9kfiISZw-1QoqmneIn1o';

// Initialize the Supabase client with optimized session configuration
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    storageKey: 'elia-go-auth',
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
    storage: typeof window !== 'undefined' ? localStorage : undefined
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  },
  global: {
    headers: {
      'X-Client-Info': 'elia-go-app'
    }
  }
});

// Expose a function to check authentication status
export const isAuthenticated = async () => {
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return !!data.session?.user;
  } catch (error) {
    console.error("Error checking authentication status:", error);
    return false;
  }
};

// Create a global auth state listener
export const setupAuthListener = (callback: (isAuthenticated: boolean) => void) => {
  return supabase.auth.onAuthStateChange((event, session) => {
    console.log("Auth state changed:", event, session ? "Session exists" : "No session");
    callback(!!session);
  });
};
