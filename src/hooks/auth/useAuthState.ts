import { useState, useEffect, useCallback } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { getAuthCache, isCacheValid, updateAuthCache } from "./authCache";

/**
 * Hook for managing auth state with caching
 */
export const useAuthState = () => {
  const [user, setUser] = useState<User | null>(getAuthCache()?.user || null);
  const [session, setSession] = useState<Session | null>(getAuthCache()?.session || null);
  const [isLoading, setIsLoading] = useState(!getAuthCache() || getAuthCache()?.isLoading);
  const [companyId, setCompanyId] = useState<string | null>(getAuthCache()?.companyId || null);

  // Refresh auth state only when needed
  useEffect(() => {
    let mounted = true;
    
    const checkSession = async () => {
      try {
        // If cache is valid, use cached data without making API calls
        if (isCacheValid()) {
          if (mounted) {
            const cache = getAuthCache()!;
            setUser(cache.user);
            setSession(cache.session);
            setCompanyId(cache.companyId);
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
            updateAuthCache(
              data.session.user,
              data.session,
              profileData?.company_id || null,
              false
            );
          } else {
            // Update cache for logged out state
            updateAuthCache(null, null, null, false);
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
  }, []);

  return {
    user,
    session,
    isLoading,
    companyId
  };
};
