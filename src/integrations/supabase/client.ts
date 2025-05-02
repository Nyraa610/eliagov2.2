
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';
import { supabaseConfig } from '@/config/supabase';

// Create Supabase client using environment-specific configuration
// This ensures we're using the correct URL and key based on the current environment
export const supabase = createClient<Database>(
  supabaseConfig.url,
  supabaseConfig.anonKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
    // Add debug logs in development environment
    global: {
      headers: {
        'x-environment': import.meta.env.MODE || 'development'
      }
    }
  }
);

// Log connection info in development mode for debugging
if (import.meta.env.DEV) {
  console.log('Supabase connection info:', {
    url: supabaseConfig.url,
    environment: import.meta.env.MODE,
    isLocalhost: supabaseConfig.url.includes('localhost')
  });
}
