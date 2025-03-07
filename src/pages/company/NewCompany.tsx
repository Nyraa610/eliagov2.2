
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { CompanyProfileForm } from "@/components/company/CompanyProfileForm";
import { Company } from "@/services/companyService";
import { UserLayout } from "@/components/user/UserLayout";

export default function NewCompany() {
  const navigate = useNavigate();
  
  const handleSuccess = (company: Company) => {
    navigate(`/company/${company.id}`);
  };
  
  return (
    <UserLayout title="Create New Company">
      <div className="flex flex-col space-y-6">
        <div className="flex items-center">
          <Button 
            variant="outline" 
            onClick={() => navigate("/companies")} 
            className="mr-4"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Companies
          </Button>
        </div>
        
        <CompanyProfileForm onSuccess={handleSuccess} />
      </div>
    </UserLayout>
  );
}
