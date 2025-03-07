
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { companyService, CompanyWithRole } from "@/services/companyService";
import { useToast } from "@/hooks/use-toast";
import { CompanyListHeader } from "./CompanyListHeader";
import { CompanyListContent } from "./CompanyListContent";

interface CompanyListProps {
  maxCompanies?: number;
  onAddSubsidiary?: () => void;
}

export function CompanyList({ maxCompanies, onAddSubsidiary }: CompanyListProps) {
  const [companies, setCompanies] = useState<CompanyWithRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("Fetching user companies");
      const data = await companyService.getUserCompanies();
      setCompanies(data);
      
      // If user has exactly one company, redirect to that company's page
      if (data.length === 1) {
        console.log("User has one company, redirecting to company page");
        navigate(`/company/${data[0].id}`);
      }
    } catch (error) {
      console.error("Error fetching companies:", error);
      
      let errorMessage = "Failed to load companies. Please try again.";
      if (error instanceof Error) {
        if (error.message.includes("infinite recursion") || 
            error.message.includes("policy for relation")) {
          errorMessage = "Database policy error. Please refresh the page and try again.";
        } else {
          errorMessage = error.message;
        }
      }
      
      setError(errorMessage);
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, [toast, navigate]);

  const handleCreateCompany = () => {
    navigate("/company/new");
  };

  const handleRefresh = () => {
    fetchCompanies();
  };

  const canAddCompany = maxCompanies ? companies.length < maxCompanies : true;

  return (
    <div>
      <CompanyListHeader
        title="Your Companies"
        onRefresh={handleRefresh}
        onCreateCompany={handleCreateCompany}
        onAddSubsidiary={onAddSubsidiary}
        canAddCompany={canAddCompany}
        showRefresh={!!error}
      />

      <CompanyListContent
        loading={loading}
        error={error}
        companies={companies}
        onRefresh={handleRefresh}
        onCreateCompany={handleCreateCompany}
      />
    </div>
  );
}
