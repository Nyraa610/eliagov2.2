
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { UseFormReturn } from "react-hook-form";
import { ActionPlanFormValues } from "./formSchema";

interface ReviewFormProps {
  form: UseFormReturn<ActionPlanFormValues>;
  onPrevious: () => void;
  onSubmit: (values: ActionPlanFormValues) => void;
}

export function ReviewForm({ form, onPrevious, onSubmit }: ReviewFormProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Review Your Action Plan</CardTitle>
        <CardDescription>
          Review your ESG action plan before submission
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <h3 className="font-medium">Short-term Goals (1 year)</h3>
          <p className="text-sm text-gray-600">{form.watch("shortTermGoals") || "No goals specified"}</p>
        </div>
        
        <div className="space-y-2">
          <h3 className="font-medium">Mid-term Goals (2-3 years)</h3>
          <p className="text-sm text-gray-600">{form.watch("midTermGoals") || "No goals specified"}</p>
        </div>
        
        <div className="space-y-2">
          <h3 className="font-medium">Long-term Goals (5+ years)</h3>
          <p className="text-sm text-gray-600">{form.watch("longTermGoals") || "No goals specified"}</p>
        </div>
        
        <div className="space-y-2">
          <h3 className="font-medium">Key Initiatives</h3>
          <p className="text-sm text-gray-600">{form.watch("keyInitiatives") || "No initiatives specified"}</p>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={onPrevious}>
          Previous
        </Button>
        <Button onClick={() => onSubmit(form.getValues())}>
          Submit Action Plan
        </Button>
      </CardFooter>
    </Card>
  );
}
