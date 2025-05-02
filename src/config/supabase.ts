
interface SupabaseConfig {
  url: string;
  anonKey: string;
}

// Priority for environment detection:
// 1. Explicit VITE_APP_ENV if set
// 2. Special VITE_LOCAL_SUPABASE flag for local development
// 3. Standard MODE from Vite
const getEnvironment = (): string => {
  if (import.meta.env.VITE_LOCAL_SUPABASE === 'true') {
    return 'local';
  }
  return import.meta.env.VITE_APP_ENV || import.meta.env.MODE || 'development';
};

const configs: Record<string, SupabaseConfig> = {
  local: {
    // For local Supabase instance (typically via CLI)
    url: 'http://localhost:54321',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'
  },
  development: {
    url: 'https://tqvylbkavunzlckhqxcl.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRxdnlsYmthdnVuemxja2hxeGNsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAzMzM4MDksImV4cCI6MjA1NTkwOTgwOX0.2CjAxh7DpNx74ncjK9f_r8W9kfiISZw-1QoqmneIn1o'
  },
  staging: {
    url: import.meta.env.VITE_SUPABASE_URL || 'https://tqvylbkavunzlckhqxcl.supabase.co',
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRxdnlsYmthdnVuemxja2hxeGNsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAzMzM4MDksImV4cCI6MjA1NTkwOTgwOX0.2CjAxh7DpNx74ncjK9f_r8W9kfiISZw-1QoqmneIn1o'
  },
  production: {
    url: import.meta.env.VITE_SUPABASE_URL || 'https://tqvylbkavunzlckhqxcl.supabase.co',
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRxdnlsYmthdnVuemxja2hxeGNsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAzMzM4MDksImV4cCI6MjA1NTkwOTgwOX0.2CjAxh7DpNx74ncjK9f_r8W9kfiISZw-1QoqmneIn1o'
  }
};

// Determine environment and export the configuration
const environment = getEnvironment();
console.log(`Using Supabase environment: ${environment}`);
export const supabaseConfig = configs[environment] || configs.development;
