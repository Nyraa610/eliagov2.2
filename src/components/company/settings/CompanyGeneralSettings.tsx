
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Company } from "@/services/companyService";
import { CompanyProfileForm } from "@/components/company/CompanyProfileForm";

interface CompanyGeneralSettingsProps {
  company: Company;
}

export function CompanyGeneralSettings({ company }: CompanyGeneralSettingsProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Company Profile</CardTitle>
          <CardDescription>
            Update your company's basic information and details
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CompanyProfileForm company={company} />
        </CardContent>
      </Card>
    </div>
  );
}
