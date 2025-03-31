
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { UserRole } from "@/services/base/profileTypes";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabaseService } from "@/services/base/supabaseService";

export const useAuthProtection = (requiredRole?: UserRole) => {
  const [hasRequiredRole, setHasRequiredRole] = useState<boolean | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isRoleLoading, setIsRoleLoading] = useState(false);
  const location = useLocation();
  const { toast } = useToast();
  const { isAuthenticated, user, isLoading: authLoading } = useAuth();
  
  // Use a reference to track if the role check has been performed
  const roleCheckPerformed = useState<boolean>(false);
  
  useEffect(() => {
    // Only check role if authenticated, a role is required, user exists,
    // and we haven't already performed the role check for this user/role combination
    if (!isAuthenticated || !requiredRole || !user || roleCheckPerformed[0]) {
      // If no role is required, set hasRequiredRole to true
      if (!requiredRole) {
        setHasRequiredRole(true);
      }
      return;
    }
    
    const checkRole = async () => {
      try {
        setIsRoleLoading(true);
        console.log(`useAuthProtection: Checking if user has role: ${requiredRole}`);
        
        const hasRole = await supabaseService.hasRole(requiredRole);
        console.log(`useAuthProtection: User has required role: ${hasRole}`);
        setHasRequiredRole(hasRole);
        roleCheckPerformed[0] = true;
        
        if (!hasRole) {
          toast({
            variant: "destructive",
            title: "Access denied",
            description: `You don't have permission to access this page.`,
          });
        }
      } catch (error: any) {
        console.error("useAuthProtection: Error checking role:", error);
        setAuthError(`Error checking role: ${error.message}`);
        setHasRequiredRole(false);
        
        toast({
          variant: "destructive",
          title: "Permission Error",
          description: error.message || "There was a problem verifying your access permissions.",
        });
      } finally {
        setIsRoleLoading(false);
      }
    };
    
    checkRole();
  }, [requiredRole, isAuthenticated, user, toast, location.pathname, roleCheckPerformed]);

  return { 
    isAuthenticated, 
    hasRequiredRole, 
    authError, 
    isLoading: authLoading || isRoleLoading
  };
};
