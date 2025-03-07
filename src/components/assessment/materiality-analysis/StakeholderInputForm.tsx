
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { UseFormReturn } from "react-hook-form";
import { MaterialityFormValues } from "./formSchema";

interface StakeholderInputFormProps {
  form: UseFormReturn<MaterialityFormValues>;
  onPrevious: () => void;
  onNext: () => void;
}

export function StakeholderInputForm({ form, onPrevious, onNext }: StakeholderInputFormProps) {
  return (
    <Form {...form}>
      <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
        <FormField
          control={form.control}
          name="impactOnStakeholders"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Impact on Stakeholders (0-10)</FormLabel>
              <FormDescription>
                Rate how these issues impact your stakeholders (customers, employees, community, etc.)
              </FormDescription>
              <FormControl>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Low Impact (0)</span>
                    <span>High Impact (10)</span>
                  </div>
                  <Slider
                    min={0}
                    max={10}
                    step={1}
                    defaultValue={[field.value]}
                    onValueChange={(vals) => field.onChange(vals[0])}
                    aria-label="Impact on stakeholders"
                  />
                  <div className="text-center font-medium">
                    Current rating: {field.value}
                  </div>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="stakeholderFeedback"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Stakeholder Feedback</FormLabel>
              <FormDescription>
                Summarize feedback collected from key stakeholders regarding material issues
              </FormDescription>
              <FormControl>
                <Textarea 
                  placeholder="Enter stakeholder feedback..." 
                  className="min-h-[150px]"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex justify-between">
          <Button type="button" variant="outline" onClick={onPrevious}>
            Previous
          </Button>
          <Button type="button" onClick={onNext}>
            Next: Prioritize
          </Button>
        </div>
      </form>
    </Form>
  );
}
