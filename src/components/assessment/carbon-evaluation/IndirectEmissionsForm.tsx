
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { CarbonEvaluationFormValues } from "./formSchema";

interface IndirectEmissionsFormProps {
  form: UseFormReturn<CarbonEvaluationFormValues>;
  onPrevious: () => void;
  onNext: () => void;
}

export function IndirectEmissionsForm({ form, onPrevious, onNext }: IndirectEmissionsFormProps) {
  return (
    <Form {...form}>
      <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
        <FormField
          control={form.control}
          name="scope2Emissions"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Scope 2 Emissions (Indirect)</FormLabel>
              <FormDescription>
                Indirect emissions from generation of purchased energy (in tCO2e)
              </FormDescription>
              <FormControl>
                <Input placeholder="Enter amount in tCO2e" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="scope3Emissions"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Scope 3 Emissions (Value Chain)</FormLabel>
              <FormDescription>
                All other indirect emissions in the value chain (in tCO2e)
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
            Next: Transportation
          </Button>
        </div>
      </form>
    </Form>
  );
}
