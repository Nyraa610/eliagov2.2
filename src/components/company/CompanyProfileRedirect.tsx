
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabaseService } from "@/services/base/supabaseService";
import { UserProfile } from "@/services/base/profileTypes";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

export function CompanyProfileRedirect() {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const redirectToCompanyProfile = async () => {
      try {
        setLoading(true);
        const profile = await supabaseService.getUserProfile();
        
        if (profile?.company_id) {
          // If user has a company, redirect to their company profile
          navigate(`/company/${profile.company_id}`);
        } else {
          // If user doesn't have a company, redirect to companies page
          navigate("/companies");
          toast({
            title: "No Company Found",
            description: "You don't have a company set up yet. Please create or join a company.",
          });
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
        navigate("/companies");
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load company information",
        });
      } finally {
        setLoading(false);
      }
    };

    redirectToCompanyProfile();
  }, [navigate, toast]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Redirecting to your company profile...</span>
      </div>
    );
  }

  return null;
}
