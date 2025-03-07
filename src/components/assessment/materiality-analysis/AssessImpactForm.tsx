
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Slider } from "@/components/ui/slider";
import { UseFormReturn } from "react-hook-form";
import { MaterialityFormValues } from "./formSchema";

interface AssessImpactFormProps {
  form: UseFormReturn<MaterialityFormValues>;
  onPrevious: () => void;
  onNext: () => void;
}

export function AssessImpactForm({ form, onPrevious, onNext }: AssessImpactFormProps) {
  return (
    <Form {...form}>
      <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
        <FormField
          control={form.control}
          name="impactOnBusiness"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Impact on Business (0-10)</FormLabel>
              <FormDescription>
                Rate how these issues impact your business operations, revenue, and strategy
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
                    aria-label="Impact on business"
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
        
        <div className="flex justify-between">
          <Button type="button" variant="outline" onClick={onPrevious}>
            Previous
          </Button>
          <Button type="button" onClick={onNext}>
            Next: Stakeholder Input
          </Button>
        </div>
      </form>
    </Form>
  );
}
