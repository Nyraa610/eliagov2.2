
import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { supabaseService, UserRole } from "@/services/base/supabaseService";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
}

export const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [hasRequiredRole, setHasRequiredRole] = useState<boolean | null>(null);
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      const user = data.session?.user;
      
      setIsAuthenticated(!!user);
      
      if (user && requiredRole) {
        const hasRole = await supabaseService.hasRole(requiredRole);
        setHasRequiredRole(hasRole);
      } else {
        setHasRequiredRole(true); // No specific role required
      }
    };
    
    checkAuth();

    // Set up auth state change listener
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setIsAuthenticated(!!session?.user);
        
        if (session?.user && requiredRole) {
          const hasRole = await supabaseService.hasRole(requiredRole);
          setHasRequiredRole(hasRole);
        } else if (!session?.user) {
          setHasRequiredRole(null);
        } else {
          setHasRequiredRole(true);
        }
      }
    );
    
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [requiredRole]);

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
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!hasRequiredRole) {
    // Doesn't have required role, redirect to unauthorized page
    return <Navigate to="/unauthorized" replace />;
  }

  // Authenticated and has required role
  return <>{children}</>;
};
