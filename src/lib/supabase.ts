
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://tqvylbkavunzlckhqxcl.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRxdnlsYmthdnVuemxja2hxeGNsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAzMzM4MDksImV4cCI6MjA1NTkwOTgwOX0.2CjAxh7DpNx74ncjK9f_r8W9kfiISZw-1QoqmneIn1o';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    storageKey: 'elia-go-auth',
    autoRefreshToken: true,
    detectSessionInUrl: false
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
