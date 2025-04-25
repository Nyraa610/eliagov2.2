
interface SupabaseConfig {
  url: string;
  anonKey: string;
}

const configs: Record<string, SupabaseConfig> = {
  development: {
    url: 'https://tqvylbkavunzlckhqxcl.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRxdnlsYmthdnVuemxja2hxeGNsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAzMzM4MDksImV4cCI6MjA1NTkwOTgwOX0.2CjAxh7DpNx74ncjK9f_r8W9kfiISZw-1QoqmneIn1o'
  },
  staging: {
    // Replace with your staging project details
    url: import.meta.env.VITE_SUPABASE_URL || 'https://tqvylbkavunzlckhqxcl.supabase.co',
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRxdnlsYmthdnVuemxja2hxeGNsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAzMzM4MDksImV4cCI6MjA1NTkwOTgwOX0.2CjAxh7DpNx74ncjK9f_r8W9kfiISZw-1QoqmneIn1o'
  },
  production: {
    // Replace with your production project details
    url: import.meta.env.VITE_SUPABASE_URL || 'https://tqvylbkavunzlckhqxcl.supabase.co',
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRxdnlsYmthdnVuemxja2hxeGNsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAzMzM4MDksImV4cCI6MjA1NTkwOTgwOX0.2CjAxh7DpNx74ncjK9f_r8W9kfiISZw-1QoqmneIn1o'
  }
};

// Determine environment based on import.meta.env.MODE
// This will be set by Vite during build process
const environment = import.meta.env.VITE_APP_ENV || import.meta.env.MODE || 'development';

// Export the configuration for the detected environment
export const supabaseConfig = configs[environment] || configs.development;
