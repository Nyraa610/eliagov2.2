
import { UseFormReturn } from "react-hook-form";
import { IROFormValues } from "./formSchema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";

interface OpportunityAssessmentFormProps {
  form: UseFormReturn<IROFormValues>;
  onPrevious: () => void;
  onSubmit: (values: IROFormValues) => void;
}

export function OpportunityAssessmentForm({ form, onPrevious, onSubmit }: OpportunityAssessmentFormProps) {
  const handleSubmit = form.handleSubmit(onSubmit);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Opportunity Assessment</CardTitle>
        <CardDescription>
          Identify sustainability opportunities and assess their relevance and value to your business
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormField
          control={form.control}
          name="identifiedOpportunities"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Describe the identified sustainability opportunities</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="List and describe the sustainability-related opportunities for your company..." 
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
          name="opportunityRelevance"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Opportunity Relevance (1 = Low Relevance, 5 = High Relevance): {field.value}
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
          name="opportunityValue"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Opportunity Value (1 = Limited Value, 5 = Exceptional Value): {field.value}
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
          <Button type="submit" onClick={handleSubmit}>
            Submit Assessment
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
