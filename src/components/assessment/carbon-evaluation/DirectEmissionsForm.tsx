
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { CarbonEvaluationFormValues } from "./formSchema";

interface DirectEmissionsFormProps {
  form: UseFormReturn<CarbonEvaluationFormValues>;
  onPrevious: () => void;
  onNext: () => void;
}

export function DirectEmissionsForm({ form, onPrevious, onNext }: DirectEmissionsFormProps) {
  return (
    <Form {...form}>
      <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
        <FormField
          control={form.control}
          name="scope1Emissions"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Scope 1 Emissions (Direct)</FormLabel>
              <FormDescription>
                Direct emissions from owned or controlled sources (in tCO2e)
              </FormDescription>
              <FormControl>
                <Input placeholder="Enter amount in tCO2e" {...field} />
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
            Next: Indirect Emissions
          </Button>
        </div>
      </form>
    </Form>
  );
}
