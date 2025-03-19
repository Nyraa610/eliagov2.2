
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "@/lib/supabase";
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
    let isMounted = true;
    
    const checkAuth = async () => {
      try {
        console.log("useAuthProtection: Checking authentication...");
        
        // First try to get the session
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("useAuthProtection: Error getting session:", error.message);
          if (isMounted) {
            setAuthError(`Error checking authentication: ${error.message}`);
            setIsAuthenticated(false);
            setHasRequiredRole(false);
            setIsLoading(false);
          }
          return;
        }
        
        const user = data.session?.user;
        
        if (user) {
          console.log("useAuthProtection: Session found for user:", user.id);
          if (isMounted) {
            setIsAuthenticated(true);
          }
          
          // If role is required, check if user has the role
          if (requiredRole) {
            console.log(`useAuthProtection: Checking if user has role: ${requiredRole}`);
            try {
              // Get user profile to check role
              const profile = await supabaseService.getUserProfile();
              
              if (profile && profile.role === 'admin') {
                // Admins have access to everything
                console.log("useAuthProtection: User is admin, granting access");
                if (isMounted) {
                  setHasRequiredRole(true);
                }
              } else if (profile) {
                // Check specific role requirements for non-admins
                const hasRole = profile.role === requiredRole;
                console.log(`useAuthProtection: User has required role: ${hasRole}`);
                if (isMounted) {
                  setHasRequiredRole(hasRole);
                }
              } else {
                console.error("useAuthProtection: Could not fetch user profile");
                if (isMounted) {
                  setHasRequiredRole(false);
                }
              }
            } catch (roleError: any) {
              console.error("useAuthProtection: Error checking role:", roleError);
              if (isMounted) {
                setAuthError(`Error checking role: ${roleError.message}`);
                setHasRequiredRole(false);
              }
            }
          } else {
            // No specific role required
            if (isMounted) {
              setHasRequiredRole(true);
            }
          }
        } else {
          console.log("useAuthProtection: No session found");
          if (isMounted) {
            setIsAuthenticated(false);
            setHasRequiredRole(!requiredRole);
          }
        }
      } catch (error: any) {
        console.error("useAuthProtection: Error checking authentication:", error);
        if (isMounted) {
          setAuthError(`Error checking authentication: ${error.message}`);
          setIsAuthenticated(false);
          setHasRequiredRole(false);
          
          toast({
            variant: "destructive",
            title: "Authentication Error",
            description: error.message || "There was a problem verifying your login.",
          });
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };
    
    checkAuth();

    // Set up auth state change listener
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log(`useAuthProtection: Auth state changed - Event: ${event}`);
        
        if (!isMounted) return;
        
        try {
          if (session?.user) {
            console.log("useAuthProtection: New session detected for user:", session.user.id);
            setIsAuthenticated(true);
            
            if (requiredRole) {
              // Get user profile to check role
              const profile = await supabaseService.getUserProfile();
              
              if (profile && profile.role === 'admin') {
                // Admins have access to everything
                setHasRequiredRole(true);
              } else if (profile) {
                // Check specific role requirements for non-admins
                const hasRole = profile.role === requiredRole;
                console.log(`useAuthProtection: User has required role after auth change: ${hasRole}`);
                setHasRequiredRole(hasRole);
              } else {
                setHasRequiredRole(false);
              }
            } else {
              setHasRequiredRole(true);
            }
          } else if (event === 'SIGNED_OUT') {
            console.log("useAuthProtection: User signed out");
            setIsAuthenticated(false);
            setHasRequiredRole(false);
          } else {
            // For other events, recheck authentication
            const { data } = await supabase.auth.getSession();
            setIsAuthenticated(!!data.session);
            setHasRequiredRole(!requiredRole || !!data.session);
          }
        } catch (error: any) {
          console.error("useAuthProtection: Error in auth change listener:", error);
          setAuthError(`Auth change error: ${error.message}`);
        } finally {
          setIsLoading(false);
        }
      }
    );
    
    return () => {
      console.log("useAuthProtection: Cleaning up auth listener");
      isMounted = false;
      authListener.subscription.unsubscribe();
    };
  }, [requiredRole, toast, location.pathname]);

  return { 
    isAuthenticated, 
    hasRequiredRole, 
    authError, 
    isLoading: isLoading
  };
};
