
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";

export function useAuthStatus() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading, companyId } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoading) {
      setLoading(false);
      
      if (!isAuthenticated) {
        toast({
          title: "Authentication required",
          description: "Please sign in to access this feature.",
          variant: "destructive",
        });
      } else if (!companyId) {
        toast({
          title: "Company association required",
          description: "Please associate your account with a company to use this feature.",
          variant: "destructive",
        });
      }
    }
  }, [isLoading, isAuthenticated, companyId, toast]);

  return {
    loading: loading || isLoading,
    isAuth: isAuthenticated,
    companyId
  };
}
