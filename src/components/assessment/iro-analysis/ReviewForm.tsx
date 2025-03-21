
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UseFormReturn } from "react-hook-form";
import { IROFormValues } from "./formSchema";
import { Separator } from "@/components/ui/separator";
import { 
  SummarySection, 
  RisksTable, 
  OpportunitiesTable, 
  ReviewFooter,
  getRiskScoreColor
} from "./review";

interface ReviewFormProps {
  form: UseFormReturn<IROFormValues>;
  onPrevious: () => void;
  onSubmit: (values: IROFormValues) => void;
}

export function ReviewForm({ form, onPrevious, onSubmit }: ReviewFormProps) {
  const { items, methodology } = form.getValues();
  
  const getImpactLabel = (value: number) => {
    const scale = methodology.impactScale;
    return scale.find(item => item.value === value)?.label || value.toString();
  };
  
  const getLikelihoodLabel = (value: number) => {
    const scale = methodology.likelihoodScale;
    return scale.find(item => item.value === value)?.label || value.toString();
  };
  
  // Filter for risks and opportunities
  const risks = items.filter(item => item.type === "risk");
  const opportunities = items.filter(item => item.type === "opportunity");
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Review & Submit</CardTitle>
        <CardDescription>
          Review your identified risks and opportunities before submission
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <SummarySection 
          totalItems={items.length}
          risksCount={risks.length}
          opportunitiesCount={opportunities.length}
        />
        
        <Separator />
        
        <RisksTable 
          risks={risks}
          getImpactLabel={getImpactLabel}
          getLikelihoodLabel={getLikelihoodLabel}
          getRiskScoreColor={getRiskScoreColor}
        />
        
        <Separator />
        
        <OpportunitiesTable 
          opportunities={opportunities}
          getImpactLabel={getImpactLabel}
          getLikelihoodLabel={getLikelihoodLabel}
        />
      </CardContent>
      <ReviewFooter 
        onPrevious={onPrevious}
        onSubmit={onSubmit}
        formValues={form.getValues()}
      />
    </Card>
  );
}
