
import React from "react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface AdditionalInfoSectionProps {
  additionalInfo: string;
  onAdditionalInfoChange: (value: string) => void;
}

export function AdditionalInfoSection({
  additionalInfo,
  onAdditionalInfoChange
}: AdditionalInfoSectionProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="additional-info">Additional Information</Label>
      <Textarea
        id="additional-info"
        value={additionalInfo || ''}
        onChange={e => onAdditionalInfoChange(e.target.value)}
        placeholder="Provide any additional information that might help generate a more accurate value chain"
        rows={3}
      />
    </div>
  );
}
