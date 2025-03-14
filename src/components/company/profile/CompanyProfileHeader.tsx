
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Settings } from "lucide-react";
import { Company } from "@/services/company/types";

interface CompanyProfileHeaderProps {
  company: Company;
  isAdmin: boolean;
}

export function CompanyProfileHeader({ company, isAdmin }: CompanyProfileHeaderProps) {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center">
        <Button variant="outline" onClick={() => navigate("/companies")} className="mr-4">
          <ChevronLeft className="h-4 w-4 mr-2" />
          Back to Companies
        </Button>
        <h1 className="text-3xl font-bold">{company.name}</h1>
      </div>
      
      {isAdmin && (
        <Button onClick={() => navigate(`/company/${company.id}/settings`)}>
          <Settings className="h-4 w-4 mr-2" />
          Company Settings
        </Button>
      )}
    </div>
  );
}
