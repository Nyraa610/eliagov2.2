
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { UseFormReturn } from "react-hook-form";
import { CarbonEvaluationFormValues } from "../formSchema";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface FramingFormProps {
  form: UseFormReturn<CarbonEvaluationFormValues>;
  onNext: () => void;
}

export function FramingForm({ form, onNext }: FramingFormProps) {
  return (
    <Form {...form}>
      <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
        <div className="bg-blue-50 border border-blue-100 rounded-md p-4 mb-6">
          <h3 className="text-lg font-medium text-blue-800 mb-2">Framing Your Carbon Evaluation</h3>
          <p className="text-sm text-blue-700">
            This step helps establish the purpose, scope, and objectives of your carbon footprint assessment. 
            Clear framing ensures that the evaluation will meet your organization's needs and provide actionable insights.
          </p>
        </div>

        <FormField
          control={form.control}
          name="companyName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Organization Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter your organization name" {...field} />
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
              <FormLabel>Reference Year</FormLabel>
              <FormDescription>
                The year for which you're calculating your carbon footprint
              </FormDescription>
              <FormControl>
                <Input placeholder="e.g., 2023" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="evaluationObjective"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Primary Objective</FormLabel>
              <FormDescription>
                What is the main purpose of conducting this carbon evaluation?
              </FormDescription>
              <FormControl>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select objective" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="baseline">Establish baseline measurement</SelectItem>
                    <SelectItem value="reduction">Develop carbon reduction strategy</SelectItem>
                    <SelectItem value="reporting">External reporting/compliance</SelectItem>
                    <SelectItem value="certification">Preparation for certification</SelectItem>
                    <SelectItem value="stakeholders">Stakeholder communication</SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="additionalObjectives"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Additional Objectives or Notes</FormLabel>
              <FormDescription>
                Any secondary objectives or specific requirements for this evaluation
              </FormDescription>
              <FormControl>
                <Textarea 
                  placeholder="e.g., Board requested carbon neutral roadmap by 2025..." 
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
            Next: Scoping
          </Button>
        </div>
      </form>
    </Form>
  );
}
