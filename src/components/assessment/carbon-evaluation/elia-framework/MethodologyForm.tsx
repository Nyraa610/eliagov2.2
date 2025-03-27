
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { UseFormReturn } from "react-hook-form";
import { CarbonEvaluationFormValues } from "../formSchema";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface MethodologyFormProps {
  form: UseFormReturn<CarbonEvaluationFormValues>;
  onPrevious: () => void;
  onSubmit: (values: CarbonEvaluationFormValues) => void;
}

export function MethodologyForm({ form, onPrevious, onSubmit }: MethodologyFormProps) {
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="bg-blue-50 border border-blue-100 rounded-md p-4 mb-6">
          <h3 className="text-lg font-medium text-blue-800 mb-2">Evaluation Methodology</h3>
          <p className="text-sm text-blue-700">
            Documenting your methodology provides transparency and helps ensure your carbon 
            evaluation is credible and reproducible. This information will be valuable for 
            future evaluations and external verification.
          </p>
        </div>

        <FormField
          control={form.control}
          name="dataQuality"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Data Quality Assessment</FormLabel>
              <FormDescription>
                How would you rate the overall quality of the data used in this evaluation?
              </FormDescription>
              <FormControl>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select data quality" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">High - Mostly measured/actual data</SelectItem>
                    <SelectItem value="medium">Medium - Mix of actual data and estimates</SelectItem>
                    <SelectItem value="low">Low - Mostly estimates and proxies</SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="emissionFactors"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Emission Factors Used</FormLabel>
              <FormDescription>
                What emission factors or databases did you use for calculations?
              </FormDescription>
              <FormControl>
                <Textarea 
                  placeholder="e.g., ADEME Base Carbone 2023, IEA electricity factors 2022..." 
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
          name="assumptions"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Key Assumptions</FormLabel>
              <FormDescription>
                Document any significant assumptions made during the evaluation
              </FormDescription>
              <FormControl>
                <Textarea 
                  placeholder="e.g., Employee commuting estimated based on survey of 30% of workforce..." 
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
          name="verificationStatus"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Verification Status</FormLabel>
              <FormDescription>
                Has this carbon evaluation been verified by a third party?
              </FormDescription>
              <FormControl>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select verification status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="verified">Verified by third party</SelectItem>
                    <SelectItem value="internal">Internally verified only</SelectItem>
                    <SelectItem value="none">Not verified</SelectItem>
                    <SelectItem value="planned">Verification planned</SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="nextEvaluation"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Next Evaluation</FormLabel>
              <FormDescription>
                When do you plan to update this carbon evaluation?
              </FormDescription>
              <FormControl>
                <Input placeholder="e.g., Q1 2024" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Alert className="bg-green-50 border-green-200 text-green-800">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle className="text-green-800">Evaluation Complete</AlertTitle>
          <AlertDescription className="text-green-700">
            You've now completed your Elia Carbon Evaluation. Click "Submit" to save your assessment and receive your results summary.
          </AlertDescription>
        </Alert>
        
        <div className="flex justify-between">
          <Button type="button" variant="outline" onClick={onPrevious}>
            Previous
          </Button>
          <Button type="submit">
            Submit Carbon Evaluation
          </Button>
        </div>
      </form>
    </Form>
  );
}
