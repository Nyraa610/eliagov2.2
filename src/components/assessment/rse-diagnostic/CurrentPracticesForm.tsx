
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { UseFormReturn } from "react-hook-form";
import * as z from "zod";

// Import the same schema from the parent component
const formSchema = z.object({
  companyName: z.string().min(2, {
    message: "Company name must be at least 2 characters.",
  }),
  industry: z.string().min(2, {
    message: "Industry must be at least 2 characters.",
  }),
  employeeCount: z.string().min(1, {
    message: "Please select the number of employees.",
  }),
  currentRSEPractices: z.string().optional(),
  mainChallenges: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface CurrentPracticesFormProps {
  form: UseFormReturn<FormValues>;
  onNext: () => void;
  onPrev: () => void;
}

export function CurrentPracticesForm({ form, onNext, onPrev }: CurrentPracticesFormProps) {
  return (
    <div className="space-y-6">
      <FormField
        control={form.control}
        name="currentRSEPractices"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Current RSE/ESG Practices</FormLabel>
            <FormDescription>
              Describe any existing sustainability or social responsibility initiatives
            </FormDescription>
            <FormControl>
              <Textarea 
                placeholder="Describe your current sustainability practices..." 
                className="min-h-[150px]"
                {...field} 
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={onPrev}>
          Previous
        </Button>
        <Button type="button" onClick={onNext}>
          Next: Stakeholders
        </Button>
      </div>
    </div>
  );
}
