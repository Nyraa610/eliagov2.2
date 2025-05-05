
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { UseFormReturn } from "react-hook-form";
import { MaterialityFormValues } from "./formSchema";

interface StakeholderInputFormProps {
  form: UseFormReturn<MaterialityFormValues>;
  onPrevious: () => void;
  onNext: () => void;
}

export function StakeholderInputForm({ form, onPrevious, onNext }: StakeholderInputFormProps) {
  const issues = form.watch("materialIssues") || [];

  return (
    <Form {...form}>
      <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
        {issues.length === 0 ? (
          <div className="p-4 border border-amber-200 bg-amber-50 rounded-md">
            <p className="text-amber-800">No material issues have been identified yet. Please go back and add some issues first.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Material Issues Summary</h3>
            <div className="grid gap-3">
              {issues.map((issue, index) => (
                <div key={issue.id || index} className="p-3 border rounded-md">
                  <div className="flex justify-between items-start">
                    <h4 className="font-medium">{issue.title}</h4>
                    <div className="text-xs text-muted-foreground">
                      {issue.category || "Uncategorized"}
                    </div>
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                    <div>Financial: <span className="font-medium">{issue.financialMateriality}/10</span></div>
                    <div>Impact: <span className="font-medium">{issue.impactMateriality}/10</span></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <FormField
          control={form.control}
          name="stakeholderFeedback"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Stakeholder Feedback</FormLabel>
              <FormDescription>
                Summarize feedback collected from key stakeholders regarding material issues
              </FormDescription>
              <FormControl>
                <Textarea 
                  placeholder="Enter stakeholder feedback..." 
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
          <Button type="button" onClick={onNext}>
            Next: Materiality Matrix
          </Button>
        </div>
      </form>
    </Form>
  );
}
