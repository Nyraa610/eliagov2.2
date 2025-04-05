
import { useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";
import { clearAuthCache, updateAuthCache } from "./authCache";

/**
 * Hook for auth-related actions
 */
export const useAuthActions = () => {
  const { toast } = useToast();

  // Manual sign out handler with cache invalidation
  const signOut = useCallback(async () => {
    try {
      await supabase.auth.signOut();
      
      // Clear cache on sign out
      clearAuthCache();
      
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

  // Manual sign in handler
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
    clearAuthCache();
    
    try {
      // Set loading state in cache
      updateAuthCache(null, null, null, true);
      
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error("Error refreshing auth state:", error);
        updateAuthCache(null, null, null, false);
        return;
      }
      
      if (data.session?.user) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('company_id')
          .eq('id', data.session.user.id)
          .single();
          
        // Update cache
        updateAuthCache(
          data.session.user,
          data.session,
          profileData?.company_id || null,
          false
        );
      } else {
        updateAuthCache(null, null, null, false);
      }
    } catch (error) {
      console.error("Error refreshing auth state:", error);
      updateAuthCache(null, null, null, false);
    }
  }, []);

  return {
    signIn,
    signOut,
    refreshAuthState,
  };
};
