
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { CarbonEvaluationFormValues } from "./formSchema";

interface CompanyInfoFormProps {
  form: UseFormReturn<CarbonEvaluationFormValues>;
  onNext: () => void;
}

export function CompanyInfoForm({ form, onNext }: CompanyInfoFormProps) {
  return (
    <Form {...form}>
      <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
        <FormField
          control={form.control}
          name="companyName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Company Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter your company name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="yearOfEvaluation"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Year of Evaluation</FormLabel>
              <FormControl>
                <Input placeholder="e.g., 2023" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex justify-end">
          <Button type="button" onClick={onNext}>
            Next: Direct Emissions
          </Button>
        </div>
      </form>
    </Form>
  );
}
