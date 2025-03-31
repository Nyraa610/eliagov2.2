
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://tqvylbkavunzlckhqxcl.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRxdnlsYmthdnVuemxja2hxeGNsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAzMzM4MDksImV4cCI6MjA1NTkwOTgwOX0.2CjAxh7DpNx74ncjK9f_r8W9kfiISZw-1QoqmneIn1o';

const isBrowser = typeof window !== 'undefined';

// Initialize the Supabase client with optimized session configuration
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: isBrowser,  // Only persist session on browser
    storageKey: 'elia-go-auth', // Custom storage key to avoid conflicts
    autoRefreshToken: isBrowser, // Only auto-refresh token on browser
    detectSessionInUrl: isBrowser, // Only detect session in URL on browser
    storage: isBrowser ? localStorage : undefined, // Use localStorage on browser only
    flowType: 'pkce',
  },
  realtime: {
    params: {
      eventsPerSecond: 2 // Reduce realtime events rate to minimize connections
    }
  },
  global: {
    headers: {
      'X-Client-Info': 'elia-go-app'
    }
  }
});

// Logging utility to help debug auth issues
export const logAuthEvent = (action: string, details?: any) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[AUTH] ${action}`, details || '');
  }
};

// Expose a function to check authentication status with minimal requests
export const isAuthenticated = async () => {
  try {
    // Check if we have a session in memory first to avoid an API call
    const sessionStr = isBrowser ? localStorage.getItem('elia-go-auth') : null;
    if (sessionStr) {
      try {
        const session = JSON.parse(sessionStr);
        // If session exists and is not expired, return true without an API call
        if (session && session.expires_at) {
          const expiresAt = new Date(session.expires_at * 1000);
          if (expiresAt > new Date()) {
            return true;
          }
        }
      } catch (e) {
        // Continue with API call if parsing fails
      }
    }
    
    // If no valid session in memory, make an API call
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      console.error("Error checking authentication status:", error);
      return false;
    }
    return !!data.session?.user;
  } catch (error) {
    console.error("Exception checking authentication status:", error);
    return false;
  }
};

// Create a global auth state listener that will be shared by all components
let globalAuthStateListener: { subscription?: { unsubscribe: () => void } } = {};

export const setupAuthListener = (callback: (isAuthenticated: boolean) => void) => {
  if (!isBrowser) {
    return { subscription: { unsubscribe: () => {} } };
  }
  
  // Clean up any existing listener before setting up a new one
  if (globalAuthStateListener.subscription) {
    globalAuthStateListener.subscription.unsubscribe();
  }
  
  logAuthEvent("Setting up global auth state listener");
  const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
    logAuthEvent("Auth state changed", { event, hasSession: !!session });
    callback(!!session);
  });
  
  globalAuthStateListener.subscription = subscription;
  return { subscription };
};
