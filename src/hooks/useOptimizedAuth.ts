import { useState, useEffect, useCallback } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";

// Cache mechanism to prevent redundant calls
let authStateCache: {
  user: User | null;
  session: Session | null;
  lastChecked: number;
  isLoading: boolean;
} | null = null;

// Cache expiry in milliseconds (5 minutes)
const CACHE_EXPIRY = 5 * 60 * 1000;

export function useOptimizedAuth() {
  const [user, setUser] = useState<User | null>(authStateCache?.user || null);
  const [session, setSession] = useState<Session | null>(authStateCache?.session || null);
  const [isLoading, setIsLoading] = useState(!authStateCache || authStateCache.isLoading);
  const { toast } = useToast();

  // Get user's company ID (caching profile data)
  const [companyId, setCompanyId] = useState<string | null>(null);
  
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
      // If cache is valid, use it without making API calls
      if (isCacheValid()) {
        if (mounted) {
          setUser(authStateCache!.user);
          setSession(authStateCache!.session);
          setIsLoading(false);
        }
        return;
      }
      
      // Otherwise, fetch fresh data
      setIsLoading(true);
      
      try {
        // Set up the auth state listener first (important for correct order)
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          (event, newSession) => {
            console.log("Auth state changed:", event);
            
            if (mounted) {
              // Update local state
              setSession(newSession);
              setUser(newSession?.user || null);
              
              // Update cache
              authStateCache = {
                user: newSession?.user || null,
                session: newSession,
                lastChecked: Date.now(),
                isLoading: false,
              };
            }
          }
        );

        // Then check for existing session
        const { data } = await supabase.auth.getSession();
        
        if (mounted) {
          // Update local state
          setSession(data.session);
          setUser(data.session?.user || null);
          
          // Update cache
          authStateCache = {
            user: data.session?.user || null,
            session: data.session,
            lastChecked: Date.now(),
            isLoading: false,
          };
          
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

  // Fetch company ID only once when user is available
  useEffect(() => {
    if (!user) {
      setCompanyId(null);
      return;
    }
    
    // If we've already fetched the company ID, don't fetch it again
    if (companyId) return;

    const fetchCompanyId = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('company_id')
          .eq('id', user.id)
          .single();
          
        if (error) {
          console.error("Error fetching profile:", error);
          return;
        }
        
        if (data?.company_id) {
          setCompanyId(data.company_id);
        }
      } catch (error) {
        console.error("Error fetching company ID:", error);
      }
    };

    fetchCompanyId();
  }, [user, companyId]);

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
      
      // Update cache manually
      authStateCache = {
        user: data.user,
        session: data.session,
        lastChecked: Date.now(),
        isLoading: false,
      };
      
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
        
        // Update cache
        authStateCache = {
          user: data.session?.user || null,
          session: data.session,
          lastChecked: Date.now(),
          isLoading: false,
        };
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
