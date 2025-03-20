
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

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
      <Label htmlFor="additional-info">Additional Information (Optional)</Label>
      <Textarea
        id="additional-info"
        placeholder="Add details about your business model, supply chain, or specific ESG goals..."
        value={additionalInfo}
        onChange={(e) => onAdditionalInfoChange(e.target.value)}
        rows={4}
      />
      <p className="text-xs text-muted-foreground">
        The more information you provide, the more accurate your value chain model will be.
      </p>
    </div>
  );
}
