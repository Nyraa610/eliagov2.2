
import { Company } from "@/services/company/types";

export interface CompanyGeneralSettingsProps {
  company: Company;
  onCompanyUpdate?: (company: Company) => void; 
}

export function CompanyGeneralSettings({ company, onCompanyUpdate }: CompanyGeneralSettingsProps) {
  // This is a stub component - the actual implementation is in a read-only file
  return null;
}
