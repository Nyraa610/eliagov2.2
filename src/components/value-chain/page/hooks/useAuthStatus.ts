
import { useState, useEffect } from "react";
import { isAuthenticated } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";

export function useAuthStatus() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [isAuth, setIsAuth] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const auth = await isAuthenticated();
        setIsAuth(auth);
        if (!auth) {
          toast({
            title: "Authentication required",
            description: "Please sign in to access this feature.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Error checking auth:", error);
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
  }, [toast]);

  return {
    loading,
    isAuth
  };
}
