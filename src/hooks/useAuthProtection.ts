
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
  
  useEffect(() => {
    const checkRole = async () => {
      // Only check role if authenticated and a role is required
      if (!isAuthenticated || !requiredRole || !user) {
        setHasRequiredRole(!requiredRole);
        return;
      }
      
      try {
        setIsRoleLoading(true);
        console.log(`useAuthProtection: Checking if user has role: ${requiredRole}`);
        
        const hasRole = await supabaseService.hasRole(requiredRole);
        console.log(`useAuthProtection: User has required role: ${hasRole}`);
        setHasRequiredRole(hasRole);
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
  }, [requiredRole, isAuthenticated, user, toast, location.pathname]);

  return { 
    isAuthenticated, 
    hasRequiredRole, 
    authError, 
    isLoading: authLoading || isRoleLoading
  };
};
