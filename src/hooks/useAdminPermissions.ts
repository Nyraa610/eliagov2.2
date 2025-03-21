
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
        const profile = await supabaseService.getUserProfile();
        
        // Admin role should have access to everything
        if (profile?.role === 'admin') {
          setHasTrainingAccess(true);
          setHasUserAccess(true);
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
