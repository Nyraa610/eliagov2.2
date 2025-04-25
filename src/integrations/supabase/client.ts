
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';
import { supabaseConfig } from '@/config/supabase';

// Create Supabase client using environment-specific configuration
export const supabase = createClient<Database>(
  supabaseConfig.url,
  supabaseConfig.anonKey
);
