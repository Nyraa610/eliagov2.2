
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Company } from "@/services/company/types";
import { companyService } from "@/services/company";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";

export function useCompanyProfile(id: string | undefined) {
  const [company, setCompany] = useState<Company | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const fetchCompany = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        // Get company details
        const data = await companyService.getCompany(id);
        setCompany(data);
        
        // Check if user is admin by looking at their profile
        const { data: user } = await supabase.auth.getUser();
        if (!user.user) {
          navigate("/login");
          return;
        }
        
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('is_company_admin')
          .eq('id', user.user.id)
          .eq('company_id', id)
          .single();
        
        if (profileError) {
          console.error("Error checking admin status:", profileError);
          setIsAdmin(false);
        } else {
          setIsAdmin(profile?.is_company_admin || false);
        }
      } catch (error) {
        console.error("Error fetching company:", error);
        toast({
          title: "Error",
          description: "Failed to load company details.",
          variant: "destructive",
        });
        navigate("/companies");
      } finally {
        setLoading(false);
      }
    };

    fetchCompany();
  }, [id, navigate, toast]);

  const handleCompanyUpdate = (updatedCompany: Company) => {
    setCompany(updatedCompany);
    toast({
      title: "Success",
      description: "Company profile updated successfully.",
    });
  };

  return {
    company,
    isAdmin,
    loading,
    handleCompanyUpdate
  };
}
