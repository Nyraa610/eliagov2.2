
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { UseFormReturn } from "react-hook-form";
import { CarbonEvaluationFormValues } from "../formSchema";
import { Input } from "@/components/ui/input";

interface StakeholdersFormProps {
  form: UseFormReturn<CarbonEvaluationFormValues>;
  onPrevious: () => void;
  onNext: () => void;
}

export function StakeholdersForm({ form, onPrevious, onNext }: StakeholdersFormProps) {
  return (
    <Form {...form}>
      <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
        <div className="bg-blue-50 border border-blue-100 rounded-md p-4 mb-6">
          <h3 className="text-lg font-medium text-blue-800 mb-2">Stakeholder Mapping</h3>
          <p className="text-sm text-blue-700">
            Identifying key stakeholders ensures that your carbon evaluation addresses the needs 
            and expectations of all relevant parties. This helps maximize the impact and usefulness 
            of your assessment.
          </p>
        </div>

        <FormField
          control={form.control}
          name="internalStakeholders"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Internal Stakeholders</FormLabel>
              <FormDescription>
                Which departments or teams within your organization need to be involved?
              </FormDescription>
              <FormControl>
                <Textarea 
                  placeholder="e.g., Sustainability team, Operations, Finance, Executive leadership..." 
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
          name="externalStakeholders"
          render={({ field }) => (
            <FormItem>
              <FormLabel>External Stakeholders</FormLabel>
              <FormDescription>
                Which external parties are interested in your carbon footprint results?
              </FormDescription>
              <FormControl>
                <Textarea 
                  placeholder="e.g., Customers, Investors, Regulators, Local communities..." 
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
          name="projectLead"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Project Lead</FormLabel>
              <FormDescription>
                Who is the main person responsible for this carbon evaluation?
              </FormDescription>
              <FormControl>
                <Input placeholder="Name and role/title" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="dataContributors"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Data Contributors</FormLabel>
              <FormDescription>
                List the key people who will provide data for this evaluation
              </FormDescription>
              <FormControl>
                <Textarea 
                  placeholder="e.g., Finance Manager (energy bills), Fleet Manager (fuel data)..." 
                  className="min-h-[100px]"
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
            Next: Carbon Data
          </Button>
        </div>
      </form>
    </Form>
  );
}
