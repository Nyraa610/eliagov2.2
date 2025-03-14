
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { companyService } from "@/services/companyService";
import { useToast } from "@/components/ui/use-toast";
import { CompanyListHeader } from "../CompanyListHeader";
import { CompanyListContent } from "../CompanyListContent";
import { supabaseService } from "@/services/base/supabaseService";
import { MoreCompaniesBox } from "./MoreCompaniesBox";

interface CompanyListContainerProps {
  maxCompanies?: number;
  onAddSubsidiary?: () => void;
}

export function CompanyListContainer({
  maxCompanies,
  onAddSubsidiary
}: CompanyListContainerProps) {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchCompanies();
  }, [toast]);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await companyService.getUserCompanies();
      console.log("Fetched companies:", data);
      setCompanies(data);
      
      const hasAdminRole = await supabaseService.hasRole('admin');
      setIsAdmin(hasAdminRole);
    } catch (error: any) {
      console.error("Error fetching companies:", error);
      setError(error.message || "Failed to load companies");
      
      toast({
        title: "Error",
        description: "Failed to load companies. Please try again.",
        variant: "destructive",
        selectable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const canCreateCompany = companies.length < (maxCompanies || Infinity) || isAdmin;
  const showMoreCompaniesBox = companies.length > 0 && !canCreateCompany;

  return (
    <div className="space-y-4">
      <CompanyListHeader 
        title="My Companies"
        onRefresh={fetchCompanies}
        onCreateCompany={() => navigate("/company/new")}
        onAddSubsidiary={onAddSubsidiary}
        canAddCompany={canCreateCompany}
        showRefresh={true}
      />
      
      <div>
        <CompanyListContent 
          companies={companies} 
          loading={loading} 
          error={error} 
          onRefresh={fetchCompanies}
          onCreateCompany={() => navigate("/company/new")}
        />
        
        {showMoreCompaniesBox && (
          <div className="mt-6">
            <MoreCompaniesBox onClick={onAddSubsidiary || (() => {})} />
          </div>
        )}
      </div>
    </div>
  );
}
