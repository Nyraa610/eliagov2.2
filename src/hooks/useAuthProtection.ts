import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { supabaseService } from "@/services/base/supabaseService";
import { UserRole } from "@/services/base/profileTypes";
import { useToast } from "@/components/ui/use-toast";

export const useAuthProtection = (requiredRole?: UserRole) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [hasRequiredRole, setHasRequiredRole] = useState<boolean | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log("useAuthProtection: Checking authentication...");
        const user = await supabaseService.getCurrentUser();
        
        if (user) {
          console.log("useAuthProtection: Session found for user:", user.id);
          setIsAuthenticated(true);
          
          // Store token in localStorage as backup strategy
          const { data } = await supabaseService.supabase.auth.getSession();
          if (data.session?.access_token) {
            localStorage.setItem('sb-auth-token', data.session.access_token);
          }
        } else {
          console.log("useAuthProtection: No session found");
          
          // Try to recover session from localStorage if available
          const localToken = localStorage.getItem('sb-auth-token');
          if (localToken) {
            console.log("useAuthProtection: Found token in localStorage, attempting to restore session");
            try {
              const { data: sessionData, error: sessionError } = await supabaseService.supabase.auth.setSession({
                access_token: localToken,
                refresh_token: "",
              });
              
              if (sessionError) {
                console.error("useAuthProtection: Error restoring session:", sessionError);
                localStorage.removeItem('sb-auth-token');
                setIsAuthenticated(false);
              } else if (sessionData.session) {
                console.log("useAuthProtection: Successfully restored session for user:", sessionData.user?.id);
                setIsAuthenticated(true);
              } else {
                setIsAuthenticated(false);
              }
            } catch (e) {
              console.error("useAuthProtection: Exception restoring session:", e);
              setIsAuthenticated(false);
            }
          } else {
            setIsAuthenticated(false);
          }
        }
        
        if (user && requiredRole) {
          console.log(`useAuthProtection: Checking if user has role: ${requiredRole}`);
          try {
            // Get user profile to check if they're an admin
            const profile = await supabaseService.getUserProfile();
            
            if (profile && profile.role === 'admin') {
              // Admins have access to everything
              console.log("useAuthProtection: User is admin, granting access");
              setHasRequiredRole(true);
            } else {
              // Check specific role requirements for non-admins
              const hasRole = await supabaseService.hasRole(requiredRole);
              console.log(`useAuthProtection: User has required role: ${hasRole}`);
              setHasRequiredRole(hasRole);
            }
          } catch (roleError: any) {
            console.error("useAuthProtection: Error checking role:", roleError);
            setAuthError(`Error checking role: ${roleError.message}`);
            setHasRequiredRole(false);
          }
        } else {
          // No specific role required or no user
          setHasRequiredRole(!requiredRole);
        }
      } catch (error: any) {
        console.error("useAuthProtection: Error checking authentication:", error);
        setAuthError(`Error checking authentication: ${error.message}`);
        setIsAuthenticated(false);
        setHasRequiredRole(false);
        
        toast({
          variant: "destructive",
          title: "Authentication Error",
          description: error.message || "There was a problem verifying your login.",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();

    // Set up auth state change listener
    const { data: authListener } = supabaseService.supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log(`useAuthProtection: Auth state changed - Event: ${event}`);
        console.log("useAuthProtection: Session data:", session ? "Session exists" : "No session");
        
        try {
          if (session?.user) {
            console.log("useAuthProtection: New session detected for user:", session.user.id);
            setIsAuthenticated(true);
            
            // Store token in localStorage as backup strategy
            localStorage.setItem('sb-auth-token', session.access_token);
            
            if (requiredRole) {
              const hasRole = await supabaseService.hasRole(requiredRole);
              console.log(`useAuthProtection: User has required role after auth change: ${hasRole}`);
              setHasRequiredRole(hasRole);
            } else {
              setHasRequiredRole(true);
            }
          } else if (event === 'SIGNED_OUT') {
            console.log("useAuthProtection: User signed out, removing token");
            localStorage.removeItem('sb-auth-token');
            setIsAuthenticated(false);
            setHasRequiredRole(false);
          } else {
            setIsAuthenticated(false);
            setHasRequiredRole(!requiredRole);
          }
        } catch (error: any) {
          console.error("useAuthProtection: Error in auth change listener:", error);
          setAuthError(`Auth change error: ${error.message}`);
        }
      }
    );
    
    return () => {
      console.log("useAuthProtection: Cleaning up auth listener");
      authListener.subscription.unsubscribe();
    };
  }, [requiredRole, toast]);

  return { 
    isAuthenticated, 
    hasRequiredRole, 
    authError, 
    isLoading: isAuthenticated === null || hasRequiredRole === null 
  };
};
