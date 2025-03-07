
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { UseFormReturn } from "react-hook-form";
import { MaterialityFormValues } from "./formSchema";

interface IdentifyIssuesFormProps {
  form: UseFormReturn<MaterialityFormValues>;
  onNext: () => void;
}

export function IdentifyIssuesForm({ form, onNext }: IdentifyIssuesFormProps) {
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
          name="materialIssues"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Material Issues</FormLabel>
              <FormDescription>
                Identify and describe the key environmental, social, and governance issues relevant to your business
              </FormDescription>
              <FormControl>
                <Textarea 
                  placeholder="List and describe material issues..." 
                  className="min-h-[150px]"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex justify-end">
          <Button type="button" onClick={onNext}>
            Next: Assess Impact
          </Button>
        </div>
      </form>
    </Form>
  );
}
