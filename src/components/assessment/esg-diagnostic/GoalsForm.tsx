
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { UseFormReturn } from "react-hook-form";
import { ESGFormValues } from "./ESGFormSchema";
import { ArrowLeft, FileCheck, Loader2 } from "lucide-react";

interface GoalsFormProps {
  form: UseFormReturn<ESGFormValues>;
  onPrev: () => void;
  isSubmitting: boolean;
}

export function GoalsForm({ form, onPrev, isSubmitting }: GoalsFormProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-medium flex items-center gap-2">
          <FileCheck className="h-5 w-5 text-yellow-500" />
          Goals & Existing Initiatives
        </h3>
        <p className="text-sm text-muted-foreground">
          Tell us about your ESG goals and any existing initiatives already in place.
        </p>
      </div>
      
      <FormField
        control={form.control}
        name="existingInitiatives"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Existing ESG/RSE Initiatives</FormLabel>
            <FormDescription>
              Do you currently have any ESG/RSE initiatives or policies in place? Please describe them.
            </FormDescription>
            <FormControl>
              <Textarea 
                placeholder="E.g., sustainability programs, CSR policies, certification standards..." 
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
        name="mainGoals"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Main Goals for this ESG Diagnostic</FormLabel>
            <FormDescription>
              What are your main goals for this ESG diagnostic? (E.g., compliance, improvement, reporting)
            </FormDescription>
            <FormControl>
              <Textarea 
                placeholder="E.g., meet regulatory requirements, improve sustainability performance, prepare for ESG reporting..." 
                className="min-h-[100px]"
                {...field} 
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={onPrev} className="gap-1">
          <ArrowLeft className="h-4 w-4" /> Previous
        </Button>
        <Button type="submit" disabled={isSubmitting} className="gap-1">
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Processing...
            </>
          ) : (
            <>
              <FileCheck className="h-4 w-4" /> Submit Diagnostic
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
