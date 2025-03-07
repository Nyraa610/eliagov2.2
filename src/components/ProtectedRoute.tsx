
import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { supabaseService, UserRole } from "@/services/base/supabaseService";
import { Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
}

export const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [hasRequiredRole, setHasRequiredRole] = useState<boolean | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const location = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log("ProtectedRoute: Checking authentication...");
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("ProtectedRoute: Error getting session:", error.message);
          setAuthError(error.message);
          setIsAuthenticated(false);
          setHasRequiredRole(false);
          
          toast({
            variant: "destructive",
            title: "Authentication Error",
            description: "There was a problem verifying your login. Please try again.",
          });
          
          return;
        }
        
        const user = data.session?.user;
        
        console.log("ProtectedRoute: Session user:", user ? user.id : "No user");
        console.log("ProtectedRoute: Full session data:", JSON.stringify(data));
        
        setIsAuthenticated(!!user);
        
        if (user && requiredRole) {
          console.log(`ProtectedRoute: Checking if user has role: ${requiredRole}`);
          try {
            const hasRole = await supabaseService.hasRole(requiredRole);
            console.log(`ProtectedRoute: User has required role: ${hasRole}`);
            setHasRequiredRole(hasRole);
          } catch (roleError: any) {
            console.error("ProtectedRoute: Error checking role:", roleError);
            setAuthError(`Error checking role: ${roleError.message}`);
            setHasRequiredRole(false);
          }
        } else {
          setHasRequiredRole(true); // No specific role required
        }
      } catch (error: any) {
        console.error("ProtectedRoute: Error checking authentication:", error);
        setAuthError(`Error checking authentication: ${error.message}`);
        setIsAuthenticated(false);
        setHasRequiredRole(false);
        
        toast({
          variant: "destructive",
          title: "Authentication Error",
          description: error.message || "There was a problem verifying your login.",
        });
      }
    };
    
    checkAuth();

    // Set up auth state change listener
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log(`ProtectedRoute: Auth state changed - Event: ${event}`);
        console.log("ProtectedRoute: Session data:", session ? "Session exists" : "No session");
        
        try {
          setIsAuthenticated(!!session?.user);
          
          if (session?.user && requiredRole) {
            const hasRole = await supabaseService.hasRole(requiredRole);
            console.log(`ProtectedRoute: User has required role after auth change: ${hasRole}`);
            setHasRequiredRole(hasRole);
          } else if (!session?.user) {
            setHasRequiredRole(null);
          } else {
            setHasRequiredRole(true);
          }
        } catch (error: any) {
          console.error("ProtectedRoute: Error in auth change listener:", error);
          setAuthError(`Auth change error: ${error.message}`);
        }
      }
    );
    
    return () => {
      console.log("ProtectedRoute: Cleaning up auth listener");
      authListener.subscription.unsubscribe();
    };
  }, [requiredRole, toast]);

  if (authError) {
    console.error("ProtectedRoute: Authentication error:", authError);
  }

  if (isAuthenticated === null || hasRequiredRole === null) {
    // Still checking authentication
    return (
      <div className="min-h-screen flex justify-center items-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    // Not authenticated, redirect to login
    console.log("ProtectedRoute: Not authenticated, redirecting to login");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!hasRequiredRole) {
    // Doesn't have required role, redirect to unauthorized page
    console.log("ProtectedRoute: Doesn't have required role, redirecting to unauthorized");
    return <Navigate to="/unauthorized" replace />;
  }

  // Authenticated and has required role
  console.log("ProtectedRoute: User authenticated and authorized, rendering children");
  return <>{children}</>;
};
