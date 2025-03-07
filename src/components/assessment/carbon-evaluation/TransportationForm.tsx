
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { UseFormReturn } from "react-hook-form";
import { CarbonEvaluationFormValues } from "./formSchema";

interface TransportationFormProps {
  form: UseFormReturn<CarbonEvaluationFormValues>;
  onPrevious: () => void;
  onSubmit: (values: CarbonEvaluationFormValues) => void;
}

export function TransportationForm({ form, onPrevious, onSubmit }: TransportationFormProps) {
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="transportationUsage"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Transportation Usage</FormLabel>
              <FormDescription>
                Describe your company's transportation usage and related emissions
              </FormDescription>
              <FormControl>
                <Textarea 
                  placeholder="Describe company vehicles, employee commuting, business travel..." 
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
          <Button type="submit">
            Submit Carbon Evaluation
          </Button>
        </div>
      </form>
    </Form>
  );
}
