import { useState, useEffect, useCallback } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";

// Global cache mechanism to prevent redundant calls across the application
let authStateCache: {
  user: User | null;
  session: Session | null;
  lastChecked: number;
  isLoading: boolean;
  companyId: string | null;
} | null = null;

// Cache expiry in milliseconds (5 minutes)
const CACHE_EXPIRY = 5 * 60 * 1000;

export function useOptimizedAuth() {
  const [user, setUser] = useState<User | null>(authStateCache?.user || null);
  const [session, setSession] = useState<Session | null>(authStateCache?.session || null);
  const [isLoading, setIsLoading] = useState(!authStateCache || authStateCache.isLoading);
  const [companyId, setCompanyId] = useState<string | null>(authStateCache?.companyId || null);
  const { toast } = useToast();

  // Check if the auth state cache is valid
  const isCacheValid = useCallback(() => {
    return (
      authStateCache !== null &&
      Date.now() - authStateCache.lastChecked < CACHE_EXPIRY
    );
  }, []);

  // Refresh auth state only when needed
  useEffect(() => {
    let mounted = true;
    
    const checkSession = async () => {
      try {
        // If cache is valid, use cached data without making API calls
        if (isCacheValid()) {
          if (mounted) {
            setUser(authStateCache!.user);
            setSession(authStateCache!.session);
            setCompanyId(authStateCache!.companyId);
            setIsLoading(false);
          }
          return;
        }
        
        // Otherwise, fetch fresh data
        setIsLoading(true);
        
        // Set up auth state listener first (important order)
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          (event, newSession) => {
            console.log("Auth state changed:", event);
            
            if (mounted) {
              // Update local state
              setSession(newSession);
              setUser(newSession?.user || null);
            }
          }
        );

        // Single auth check for session
        const { data } = await supabase.auth.getSession();
        
        if (mounted) {
          // Update local state
          setSession(data.session);
          setUser(data.session?.user || null);
          
          // If we have a user, fetch the company ID once as part of auth
          if (data.session?.user) {
            const { data: profileData } = await supabase
              .from('profiles')
              .select('company_id')
              .eq('id', data.session.user.id)
              .single();
              
            setCompanyId(profileData?.company_id || null);
            
            // Update global cache
            authStateCache = {
              user: data.session.user,
              session: data.session,
              companyId: profileData?.company_id || null,
              lastChecked: Date.now(),
              isLoading: false,
            };
          } else {
            // Update cache for logged out state
            authStateCache = {
              user: null,
              session: null,
              companyId: null,
              lastChecked: Date.now(),
              isLoading: false,
            };
          }
          
          setIsLoading(false);
        }

        return () => {
          subscription.unsubscribe();
        };
      } catch (error) {
        console.error("Error checking auth state:", error);
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    checkSession();
    
    return () => {
      mounted = false;
    };
  }, [isCacheValid, toast]);

  // Manual sign out handler with cache invalidation
  const signOut = useCallback(async () => {
    try {
      await supabase.auth.signOut();
      
      // Clear cache on sign out
      authStateCache = null;
      
      // Update local state
      setUser(null);
      setSession(null);
      setCompanyId(null);
      
      return { error: null };
    } catch (error: any) {
      console.error("Error signing out:", error);
      toast({
        variant: "destructive",
        title: "Error signing out",
        description: error.message || "An unexpected error occurred",
      });
      
      return { error };
    }
  }, [toast]);

  // Manual sign in handler with cache update
  const signIn = useCallback(async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        return { error };
      }
      
      return { error: null };
    } catch (error) {
      return { error };
    }
  }, []);

  // Helper to force refresh the auth state
  const refreshAuthState = useCallback(async () => {
    // Invalidate cache
    authStateCache = null;
    
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error("Error refreshing auth state:", error);
        setUser(null);
        setSession(null);
      } else {
        setUser(data.session?.user || null);
        setSession(data.session);
        
        if (data.session?.user) {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('company_id')
            .eq('id', data.session.user.id)
            .single();
            
          setCompanyId(profileData?.company_id || null);
          
          // Update cache
          authStateCache = {
            user: data.session.user,
            session: data.session,
            companyId: profileData?.company_id || null,
            lastChecked: Date.now(),
            isLoading: false,
          };
        }
      }
    } catch (error) {
      console.error("Error refreshing auth state:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    user,
    session,
    isLoading,
    isAuthenticated: !!user,
    companyId,
    signIn,
    signOut,
    refreshAuthState,
  };
}
