
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { UseFormReturn } from "react-hook-form";
import { ActionPlanFormValues } from "./formSchema";

interface TimelineFormProps {
  form: UseFormReturn<ActionPlanFormValues>;
  onPrevious: () => void;
  onNext: () => void;
}

export function TimelineForm({ form, onPrevious, onNext }: TimelineFormProps) {
  return (
    <Form {...form}>
      <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
        <FormField
          control={form.control}
          name="timeline"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Implementation Timeline</FormLabel>
              <FormDescription>
                Provide a detailed timeline for implementing your ESG initiatives
              </FormDescription>
              <FormControl>
                <Textarea 
                  placeholder="Detail your implementation timeline..." 
                  className="min-h-[200px]"
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
            Next: Review & Submit
          </Button>
        </div>
      </form>
    </Form>
  );
}
