
import React from "react";
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
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="company-name">Company Name</Label>
        <Input 
          id="company-name" 
          value={companyName} 
          onChange={e => onCompanyNameChange(e.target.value)}
          placeholder="Enter company name" 
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="industry">Industry</Label>
        <Input 
          id="industry" 
          value={industry} 
          onChange={e => onIndustryChange(e.target.value)}
          placeholder="e.g. Manufacturing, Technology, Retail" 
          required
        />
      </div>
    </div>
  );
}
