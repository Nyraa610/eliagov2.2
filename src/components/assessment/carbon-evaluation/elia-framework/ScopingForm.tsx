
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { UseFormReturn } from "react-hook-form";
import { CarbonEvaluationFormValues } from "../formSchema";
import { Checkbox } from "@/components/ui/checkbox";

interface ScopingFormProps {
  form: UseFormReturn<CarbonEvaluationFormValues>;
  onPrevious: () => void;
  onNext: () => void;
}

export function ScopingForm({ form, onPrevious, onNext }: ScopingFormProps) {
  const scopeItems = [
    { id: "scope1", label: "Scope 1: Direct emissions from owned or controlled sources" },
    { id: "scope2", label: "Scope 2: Indirect emissions from purchased electricity, heat, and steam" },
    { id: "scope3_purchased", label: "Scope 3: Purchased goods and services" },
    { id: "scope3_capital", label: "Scope 3: Capital goods" },
    { id: "scope3_fuel", label: "Scope 3: Fuel and energy-related activities" },
    { id: "scope3_transport", label: "Scope 3: Transportation and distribution" },
    { id: "scope3_waste", label: "Scope 3: Waste generated in operations" },
    { id: "scope3_travel", label: "Scope 3: Business travel" },
    { id: "scope3_commuting", label: "Scope 3: Employee commuting" },
    { id: "scope3_assets", label: "Scope 3: Leased assets" },
    { id: "scope3_products", label: "Scope 3: Processing and use of sold products" },
    { id: "scope3_eol", label: "Scope 3: End-of-life treatment of sold products" },
    { id: "scope3_franchises", label: "Scope 3: Franchises" },
    { id: "scope3_investments", label: "Scope 3: Investments" },
  ];

  return (
    <Form {...form}>
      <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
        <div className="bg-blue-50 border border-blue-100 rounded-md p-4 mb-6">
          <h3 className="text-lg font-medium text-blue-800 mb-2">Defining Your Evaluation Scope</h3>
          <p className="text-sm text-blue-700">
            The scope determines which emission sources will be included in your carbon footprint. 
            A comprehensive assessment should include all relevant scopes, but you may start with 
            Scopes 1 and 2 if this is your first evaluation.
          </p>
        </div>

        <FormField
          control={form.control}
          name="organizationalBoundary"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Organizational Boundary</FormLabel>
              <FormDescription>
                Define which parts of your organization will be included in this evaluation
              </FormDescription>
              <FormControl>
                <Textarea 
                  placeholder="e.g., All operations in France, excluding recently acquired subsidiaries..." 
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
          name="operationalBoundary"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Operational Boundary</FormLabel>
              <FormDescription>
                Select which emission sources (scopes) you will include in this evaluation
              </FormDescription>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                {scopeItems.map((item) => (
                  <FormField
                    key={item.id}
                    control={form.control}
                    name="includedScopes"
                    render={({ field }) => {
                      return (
                        <FormItem
                          key={item.id}
                          className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-3"
                        >
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(item.id)}
                              onCheckedChange={(checked) => {
                                const currentValues = field.value || [];
                                return checked
                                  ? field.onChange([...currentValues, item.id])
                                  : field.onChange(
                                      currentValues.filter((value) => value !== item.id)
                                    );
                              }}
                            />
                          </FormControl>
                          <FormLabel className="text-sm font-normal cursor-pointer">
                            {item.label}
                          </FormLabel>
                        </FormItem>
                      );
                    }}
                  />
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="exclusions"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Exclusions and Limitations</FormLabel>
              <FormDescription>
                Note any specific activities, sites, or emissions that will be excluded from this evaluation
              </FormDescription>
              <FormControl>
                <Textarea 
                  placeholder="e.g., Remote offices with fewer than 5 employees will be excluded..." 
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
            Next: Stakeholders
          </Button>
        </div>
      </form>
    </Form>
  );
}
