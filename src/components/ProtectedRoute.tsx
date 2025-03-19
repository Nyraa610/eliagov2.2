
import { Navigate, useLocation } from "react-router-dom";
import { UserRole } from "@/services/base/profileTypes";
import { Loader2 } from "lucide-react";
import { useAuthProtection } from "@/hooks/useAuthProtection";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
}

export const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const location = useLocation();
  const { isAuthenticated, hasRequiredRole, authError, isLoading } = useAuthProtection(requiredRole);

  if (authError) {
    console.error("ProtectedRoute: Authentication error:", authError);
  }

  if (isLoading) {
    // Still checking authentication
    return (
      <div className="min-h-screen flex flex-col justify-center items-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
        <p className="text-gray-600">Verifying authentication...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Not authenticated, redirect to login
    console.log("ProtectedRoute: Not authenticated, redirecting to login with return path:", location.pathname);
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
