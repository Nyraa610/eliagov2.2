
import { useState, useEffect } from "react";
import { isAuthenticated } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";

export function useAuthStatus() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [isAuth, setIsAuth] = useState(false);
  const [companyId, setCompanyId] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const auth = await isAuthenticated();
        setIsAuth(auth);
        
        if (auth) {
          // Get user's company info
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('company_id')
              .eq('id', user.id)
              .single();
              
            if (profile?.company_id) {
              setCompanyId(profile.company_id);
            } else {
              toast({
                title: "Company association required",
                description: "Please associate your account with a company to use this feature.",
                variant: "destructive",
              });
            }
          }
        } else {
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
    isAuth,
    companyId
  };
}
