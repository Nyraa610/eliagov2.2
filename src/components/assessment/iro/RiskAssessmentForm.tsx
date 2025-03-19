
import { UseFormReturn } from "react-hook-form";
import { IROFormValues } from "./formSchema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";

interface RiskAssessmentFormProps {
  form: UseFormReturn<IROFormValues>;
  onPrevious: () => void;
  onNext: () => void;
}

export function RiskAssessmentForm({ form, onPrevious, onNext }: RiskAssessmentFormProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Risk Assessment</CardTitle>
        <CardDescription>
          Identify potential sustainability risks and assess their likelihood and severity
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormField
          control={form.control}
          name="identifiedRisks"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Describe the identified sustainability risks</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="List and describe the sustainability-related risks that your company faces..." 
                  {...field} 
                  className="min-h-[150px]"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="riskProbability"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Risk Probability (1 = Very Low, 5 = Very High): {field.value}
              </FormLabel>
              <FormControl>
                <Slider 
                  min={1} 
                  max={5} 
                  step={1} 
                  defaultValue={[field.value]}
                  onValueChange={(value) => field.onChange(value[0])}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="riskSeverity"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Risk Severity (1 = Minimal, 5 = Critical): {field.value}
              </FormLabel>
              <FormControl>
                <Slider 
                  min={1} 
                  max={5} 
                  step={1} 
                  defaultValue={[field.value]}
                  onValueChange={(value) => field.onChange(value[0])}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex justify-between">
          <Button variant="outline" onClick={onPrevious}>
            Previous
          </Button>
          <Button onClick={onNext}>
            Next: Opportunities
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
