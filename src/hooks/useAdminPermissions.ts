
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabaseService } from "@/services/base/supabaseService";

export function useAdminPermissions() {
  const [isLoading, setIsLoading] = useState(true);
  const [hasTrainingAccess, setHasTrainingAccess] = useState(false);
  const [hasUserAccess, setHasUserAccess] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const checkAdminPermissions = async () => {
      try {
        setIsLoading(true);
        
        // Check if user has admin role
        const hasAdminRole = await supabaseService.hasRole('admin');
        
        if (hasAdminRole) {
          console.log("User has admin role, granting all admin permissions");
          setHasTrainingAccess(true);
          setHasUserAccess(true);
        } else {
          // If not admin, check specific permissions
          console.log("User is not admin, checking specific permissions");
          setHasTrainingAccess(false);
          setHasUserAccess(false);
        }
      } catch (error) {
        console.error("Error checking admin permissions:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to verify admin permissions"
        });
      } finally {
        setIsLoading(false);
      }
    };

    checkAdminPermissions();
  }, [toast]);

  return {
    isLoading,
    hasTrainingAccess,
    hasUserAccess
  };
}
