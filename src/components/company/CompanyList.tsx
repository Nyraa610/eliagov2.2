
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabaseService } from "@/services/base/supabaseService";
import { companyService } from "@/services/companyService";
import { useToast } from "@/components/ui/use-toast";
import { CompanyListHeader } from "./CompanyListHeader";
import { CompanyListContent } from "./CompanyListContent";
import { supabase } from "@/lib/supabase"; // Add import for supabase

interface CompanyListProps {
  maxCompanies?: number;
  onAddSubsidiary?: () => void;
}

export function CompanyList({ maxCompanies, onAddSubsidiary }: CompanyListProps) {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Get companies when component mounts
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Check if we have an authenticated session first
        const { data: sessionData } = await supabase.auth.getSession();
        if (!sessionData.session) {
          throw new Error("You must be logged in to view companies");
        }
        
        const data = await companyService.getUserCompanies();
        console.log("Fetched companies:", data);
        setCompanies(data);
        
        // Check if user is admin to enable additional features
        const hasAdminRole = await supabaseService.hasRole('admin');
        setIsAdmin(hasAdminRole);
      } catch (error: any) {
        console.error("Error fetching companies:", error);
        setError(error.message || "Failed to load companies");
        
        toast({
          title: "Error",
          description: "Failed to load companies. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCompanies();
  }, [toast]);

  const refreshCompanies = async () => {
    try {
      setLoading(true);
      const data = await companyService.getUserCompanies();
      setCompanies(data);
    } catch (error) {
      console.error("Error refreshing companies:", error);
      toast({
        title: "Error",
        description: "Failed to refresh companies. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // User can create company if they have no companies or are admin
  const canCreateCompany = companies.length < (maxCompanies || Infinity) || isAdmin;

  return (
    <div className="space-y-4">
      <CompanyListHeader 
        title="My Companies"
        onRefresh={refreshCompanies}
        onCreateCompany={() => navigate("/company/new")}
        onAddSubsidiary={onAddSubsidiary}
        canAddCompany={canCreateCompany}
        showRefresh={true}
      />
      
      <CompanyListContent 
        companies={companies} 
        loading={loading} 
        error={error} 
        onRefresh={refreshCompanies}
        onCreateCompany={() => navigate("/company/new")}
      />
    </div>
  );
}
