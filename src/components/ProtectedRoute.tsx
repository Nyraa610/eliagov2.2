
import { Navigate, useLocation } from "react-router-dom";
import { UserRole } from "@/services/base/profileTypes";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { supabaseService } from "@/services/base/supabaseService";
import { useToast } from "@/components/ui/use-toast";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
  requireAdmin?: boolean; // Added this property
  requireConsultant?: boolean; // Added this property
}

export const ProtectedRoute = ({ children, requiredRole, requireAdmin, requireConsultant }: ProtectedRouteProps) => {
  const location = useLocation();
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();
  const [hasRequiredRole, setHasRequiredRole] = useState<boolean | null>(null);
  const [isRoleLoading, setIsRoleLoading] = useState<boolean>(false);
  const [roleError, setRoleError] = useState<string | null>(null);
  const { toast } = useToast();
  
  const [roleChecked, setRoleChecked] = useState(false);

  useEffect(() => {
    // Convert the requireAdmin/requireConsultant props to the corresponding role
    const effectiveRequiredRole = 
      requireAdmin ? 'admin' as UserRole : 
      requireConsultant ? 'consultant' as UserRole : 
      requiredRole;

    if (!isAuthenticated || !effectiveRequiredRole || !user || roleChecked) {
      return;
    }

    const checkUserRole = async () => {
      try {
        setIsRoleLoading(true);
        console.log(`ProtectedRoute: Checking if user has role: ${effectiveRequiredRole}`);
        
        const hasRole = await supabaseService.hasRole(effectiveRequiredRole);
        setHasRequiredRole(hasRole);
        setRoleChecked(true);
        
        if (!hasRole) {
          console.log("ProtectedRoute: User doesn't have required role:", effectiveRequiredRole);
          toast({
            variant: "destructive",
            title: "Access Denied",
            description: `You don't have the required ${effectiveRequiredRole} role to access this page.`
          });
        }
      } catch (error: any) {
        console.error("ProtectedRoute: Error checking user role:", error);
        setRoleError(error.message || "Error checking permissions");
        toast({
          variant: "destructive",
          title: "Permission Error",
          description: error.message || "Error checking access permissions"
        });
      } finally {
        setIsRoleLoading(false);
      }
    };
    
    checkUserRole();
  }, [isAuthenticated, requiredRole, requireAdmin, requireConsultant, user, toast, roleChecked]);

  if (authLoading || (isAuthenticated && (requiredRole || requireAdmin || requireConsultant) && isRoleLoading)) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
        <p className="text-gray-600">
          {authLoading ? "Verifying authentication..." : "Checking permissions..."}
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    console.log("ProtectedRoute: Not authenticated, redirecting to login with return path:", location.pathname);
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if ((requiredRole || requireAdmin || requireConsultant) && hasRequiredRole === false) {
    console.log("ProtectedRoute: Doesn't have required role, redirecting to unauthorized");
    return <Navigate to="/unauthorized" replace />;
  }

  if (roleError) {
    console.error("ProtectedRoute: Error checking role:", roleError);
    return <Navigate to="/unauthorized" replace />;
  }

  console.log("ProtectedRoute: User authenticated and authorized, rendering children");
  return <>{children}</>;
};
