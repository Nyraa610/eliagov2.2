
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CompanyProfileForm } from "@/components/company/CompanyProfileForm";
import { RegistryInformation } from "@/components/company/profile/RegistryInformation";
import { Company } from "@/services/company/types";

interface SettingsTabProps {
  company: Company;
  onCompanyUpdate: (company: Company) => void;
}

export function SettingsTab({ company, onCompanyUpdate }: SettingsTabProps) {
  return (
    <div className="space-y-6">
      <RegistryInformation company={company} onUpdate={() => window.location.reload()} />
      
      <Card>
        <CardHeader>
          <CardTitle>Company Profile</CardTitle>
          <CardDescription>
            Update your company's basic information and details
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CompanyProfileForm company={company} onSuccess={onCompanyUpdate} />
        </CardContent>
      </Card>
    </div>
  );
}
