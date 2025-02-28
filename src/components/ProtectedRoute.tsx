
import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { supabaseService, UserRole } from "@/services/base/supabaseService";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
}

export const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [hasRequiredRole, setHasRequiredRole] = useState<boolean | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      const user = await supabaseService.getCurrentUser();
      setIsAuthenticated(!!user);
      setUserEmail(user?.email || null);
      
      if (user && requiredRole) {
        // Special case for alex.gon@eliago.com admin
        if (user.email === 'alex.gon@eliago.com' && requiredRole === 'admin') {
          // Ensure they have admin role in the database
          await supabaseService.ensureUserRole('alex.gon@eliago.com');
          setHasRequiredRole(true);
        } else {
          const hasRole = await supabaseService.hasRole(requiredRole);
          setHasRequiredRole(hasRole);
        }
      } else {
        setHasRequiredRole(true); // No specific role required
      }
    };
    
    checkAuth();
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

  // Special case for alex.gon@eliago.com
  if (userEmail === 'alex.gon@eliago.com' && requiredRole === 'admin') {
    // Allow access to admin pages for this specific email
    return <>{children}</>;
  }

  if (!hasRequiredRole) {
    // Doesn't have required role, redirect to unauthorized page
    return <Navigate to="/unauthorized" replace />;
  }

  // Authenticated and has required role
  return <>{children}</>;
};
