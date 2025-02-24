
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://bzilzsscivtgpjulcmxj.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ6aWx6c3NjaXZ0Z3BqdWxjbXhqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDc4NDQ0NzEsImV4cCI6MjAyMzQyMDQ3MX0.SuUYLYVfmZl4OAVkiahOtb7mIRxIpRoDnVGJg88jNic';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});
