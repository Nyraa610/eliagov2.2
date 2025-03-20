
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface CompanyInfoSectionProps {
  companyName: string;
  industry: string;
  onCompanyNameChange: (value: string) => void;
  onIndustryChange: (value: string) => void;
}

export function CompanyInfoSection({
  companyName,
  industry,
  onCompanyNameChange,
  onIndustryChange
}: CompanyInfoSectionProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="company-name">Company Name</Label>
        <Input
          id="company-name"
          placeholder="Enter your company name"
          value={companyName}
          onChange={(e) => onCompanyNameChange(e.target.value)}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="industry">Industry</Label>
        <Input
          id="industry"
          placeholder="e.g. Manufacturing, IT Services, Retail"
          value={industry}
          onChange={(e) => onIndustryChange(e.target.value)}
        />
      </div>
    </div>
  );
}
