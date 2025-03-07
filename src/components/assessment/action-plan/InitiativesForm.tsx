
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { UseFormReturn } from "react-hook-form";
import { ActionPlanFormValues } from "./formSchema";

interface InitiativesFormProps {
  form: UseFormReturn<ActionPlanFormValues>;
  onPrevious: () => void;
  onNext: () => void;
}

export function InitiativesForm({ form, onPrevious, onNext }: InitiativesFormProps) {
  return (
    <Form {...form}>
      <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
        <FormField
          control={form.control}
          name="keyInitiatives"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Key Initiatives</FormLabel>
              <FormDescription>
                Outline the key initiatives or projects that will help you achieve your ESG goals
              </FormDescription>
              <FormControl>
                <Textarea 
                  placeholder="Describe your key initiatives..." 
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
            Next: Timeline
          </Button>
        </div>
      </form>
    </Form>
  );
}
