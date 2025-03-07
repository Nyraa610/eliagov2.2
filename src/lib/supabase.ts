
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://tqvylbkavunzlckhqxcl.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRxdnlsYmthdnVuemxja2hxeGNsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAzMzM4MDksImV4cCI6MjA1NTkwOTgwOX0.2CjAxh7DpNx74ncjK9f_r8W9kfiISZw-1QoqmneIn1o';

// Initialize the Supabase client with enhanced session configuration
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    storageKey: 'elia-go-auth',
    autoRefreshToken: true,
    detectSessionInUrl: true // Enable detecting auth tokens in URL
  },
  global: {
    headers: {
      'Content-Type': 'application/json',
    },
  },
  db: {
    schema: 'public'
  }
});

// Expose a function to check authentication status
export const isAuthenticated = async () => {
  const { data, error } = await supabase.auth.getSession();
  console.log("Auth check - Session data:", data);
  console.log("Auth check - Error:", error);
  return !!data.session?.user;
};
