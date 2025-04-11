
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CompanyProfileForm } from "@/components/company/CompanyProfileForm";
import { RegistryInformation } from "@/components/company/profile/RegistryInformation";
import { Company } from "@/services/company/types";
import { CompanyGeneralSettings } from "@/components/company/settings/CompanyGeneralSettings";
import { StorageManagement } from "@/components/company/settings/StorageManagement";
import { SubscriptionManagement } from "@/components/company/settings/SubscriptionManagement";

interface SettingsTabProps {
  company: Company;
  onCompanyUpdate: (company: Company) => void;
}

export function SettingsTab({ company, onCompanyUpdate }: SettingsTabProps) {
  return (
    <div className="space-y-6">
      <RegistryInformation company={company} onUpdate={() => window.location.reload()} />
      
      <SubscriptionManagement company={company} />
      
      <CompanyGeneralSettings company={company} onCompanyUpdate={onCompanyUpdate} />
      
      <StorageManagement company={company} />
    </div>
  );
}
