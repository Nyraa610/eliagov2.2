
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { UseFormReturn } from "react-hook-form";
import { ActionPlanFormValues } from "./formSchema";

interface GoalsFormProps {
  form: UseFormReturn<ActionPlanFormValues>;
  onNext: () => void;
}

export function GoalsForm({ form, onNext }: GoalsFormProps) {
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
          name="shortTermGoals"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Short-term ESG Goals (1 year)</FormLabel>
              <FormDescription>
                Define your short-term ESG goals and targets for the next year
              </FormDescription>
              <FormControl>
                <Textarea 
                  placeholder="List your short-term goals..." 
                  className="min-h-[100px]"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="midTermGoals"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mid-term ESG Goals (2-3 years)</FormLabel>
              <FormDescription>
                Define your mid-term ESG goals and targets for the next 2-3 years
              </FormDescription>
              <FormControl>
                <Textarea 
                  placeholder="List your mid-term goals..." 
                  className="min-h-[100px]"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="longTermGoals"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Long-term ESG Goals (5+ years)</FormLabel>
              <FormDescription>
                Define your long-term ESG goals and targets for the next 5+ years
              </FormDescription>
              <FormControl>
                <Textarea 
                  placeholder="List your long-term goals..." 
                  className="min-h-[100px]"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex justify-end">
          <Button type="button" onClick={onNext}>
            Next: Key Initiatives
          </Button>
        </div>
      </form>
    </Form>
  );
}
