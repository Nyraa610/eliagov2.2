
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabaseService } from "@/services/base/supabaseService";

export function useAdminPanelAuth() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        setIsLoading(true);
        
        const hasAdminRole = await supabaseService.hasRole('admin');
        setIsAdmin(hasAdminRole);
        
        if (!hasAdminRole) {
          toast({
            variant: "destructive",
            title: "Access denied",
            description: "You don't have permission to access this page.",
          });
          navigate("/");
        }
      } catch (error) {
        console.error("Error checking admin role:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to verify admin permissions.",
        });
        navigate("/");
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAdmin();
  }, [navigate, toast]);

  return {
    isAdmin,
    isLoading
  };
}
