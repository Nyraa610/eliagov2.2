
import { useState, useEffect } from "react";
import { User, Session } from "@supabase/supabase-js";
import { authService } from "@/services/auth/authService";

/**
 * Hook for managing authentication state
 */
export function useAuthState() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        setIsLoading(true);
        
        // First set up the auth state listener
        const subscription = authService.onAuthStateChange(
          (event, newSession) => {
            if (newSession) {
              setSession(newSession);
              setUser(newSession.user);
            } else if (event === 'SIGNED_OUT') {
              setSession(null);
              setUser(null);
            }
          }
        );

        // Then check for an existing session
        const { session: existingSession } = await authService.getSession();
        if (existingSession) {
          setSession(existingSession);
          setUser(existingSession.user);
        }
        
        return () => {
          subscription.unsubscribe();
        };
      } catch (error) {
        console.error("Error in auth initialization:", error);
      } finally {
        setIsLoading(false);
      }
    };

    // Initialize auth
    const cleanup = initAuth();
    
    // Clean up on unmount
    return () => {
      cleanup.then(unsub => unsub && unsub());
    };
  }, []);

  return {
    user,
    session,
    isLoading,
    isAuthenticated: !!user
  };
}
