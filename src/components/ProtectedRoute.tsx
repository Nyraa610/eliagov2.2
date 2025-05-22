import { Navigate, useLocation } from "react-router-dom";
import { UserRole } from "@/services/base/profileTypes";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { supabaseService } from "@/services/base/supabaseService";
import { useToast } from "@/components/ui/use-toast";

interface ProtectedRouteProps {
  children: React.ReactNode;
  roles?: string[];  // Added roles prop
  requiredRole?: UserRole;
  requireAdmin?: boolean;
  requireConsultant?: boolean;
}

export const ProtectedRoute = ({ children, roles, requiredRole, requireAdmin, requireConsultant }: ProtectedRouteProps) => {
  const location = useLocation();
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();
  const [hasRequiredRole, setHasRequiredRole] = useState<boolean | null>(null);
  const [isRoleLoading, setIsRoleLoading] = useState<boolean>(false);
  const [roleError, setRoleError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Convert the requireAdmin/requireConsultant props to the corresponding role
    // If roles is provided, use that instead
    const effectiveRequiredRole = 
      roles ? roles[0] as UserRole :
      requireAdmin ? 'admin' as UserRole : 
      requireConsultant ? 'consultant' as UserRole : 
      requiredRole;

    // Skip role check if no role is required or user isn't authenticated yet
    if (!isAuthenticated || (!effectiveRequiredRole && !roles) || !user) {
      return;
    }

    const checkUserRole = async () => {
      try {
        setIsRoleLoading(true);
        console.log(`ProtectedRoute: Checking if user has role: ${effectiveRequiredRole || roles?.join(', ')}`);
        
        let hasRole = false;
        
        if (roles && roles.length > 0) {
          // Check if user has any of the roles in the roles array
          for (const role of roles) {
            const hasThisRole = await supabaseService.hasRole(role as UserRole);
            if (hasThisRole) {
              hasRole = true;
              break;
            }
          }
        } else if (effectiveRequiredRole) {
          // Check if user has the specific required role
          hasRole = await supabaseService.hasRole(effectiveRequiredRole);
        } else {
          // No specific role required, so user has necessary roles
          hasRole = true;
        }
        
        console.log(`ProtectedRoute: User has required role(s): ${hasRole}`);
        setHasRequiredRole(hasRole);
        
        if (!hasRole) {
          console.warn(`ProtectedRoute: User doesn't have required role(s): ${effectiveRequiredRole || roles?.join(', ')}`);
          toast({
            variant: "destructive",
            title: "Access Denied",
            description: `You don't have the required permissions to access this page.`
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
  }, [isAuthenticated, requiredRole, requireAdmin, requireConsultant, user, toast, roles]);

  if (authLoading || (isAuthenticated && ((requiredRole || requireAdmin || requireConsultant || roles) && isRoleLoading))) {
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

  if ((requiredRole || requireAdmin || requireConsultant || roles) && hasRequiredRole === false) {
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
