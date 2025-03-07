
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { CompanyProfileForm } from "@/components/company/CompanyProfileForm";
import { Company } from "@/services/companyService";

export default function NewCompany() {
  const navigate = useNavigate();
  
  const handleSuccess = (company: Company) => {
    navigate(`/company/${company.id}`);
  };
  
  return (
    <div className="container py-8">
      <div className="flex items-center mb-6">
        <Button variant="outline" onClick={() => navigate("/companies")} className="mr-4">
          <ChevronLeft className="h-4 w-4 mr-2" />
          Back to Companies
        </Button>
        <h1 className="text-3xl font-bold">Create New Company</h1>
      </div>
      
      <CompanyProfileForm onSuccess={handleSuccess} />
    </div>
  );
}
