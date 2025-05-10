
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
    // Skip role check if no role is required or user isn't authenticated yet
    if (!isAuthenticated || !requiredRole || !user) {
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
        
        if (!hasRole) {
          console.warn("User doesn't have required role:", requiredRole);
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
  }, [requiredRole, isAuthenticated, user, toast, location.pathname]);

  return { 
    isAuthenticated, 
    hasRequiredRole, 
    authError, 
    isLoading: authLoading || isRoleLoading
  };
};
