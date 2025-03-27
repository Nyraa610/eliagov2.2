
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { UseFormReturn } from "react-hook-form";
import { CarbonEvaluationFormValues } from "../formSchema";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

interface SynthesisFormProps {
  form: UseFormReturn<CarbonEvaluationFormValues>;
  onPrevious: () => void;
  onNext: () => void;
}

export function SynthesisForm({ form, onPrevious, onNext }: SynthesisFormProps) {
  // Calculate total emissions based on available data
  const calculateTotal = () => {
    const scope1 = parseFloat(form.watch("scope1Emissions") || "0");
    const scope2 = parseFloat(form.watch("scope2Emissions") || "0");
    const scope3 = parseFloat(form.watch("scope3Emissions") || "0");
    return (scope1 + scope2 + scope3).toFixed(2);
  };

  return (
    <Form {...form}>
      <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
        <div className="bg-blue-50 border border-blue-100 rounded-md p-4 mb-6">
          <h3 className="text-lg font-medium text-blue-800 mb-2">Results Synthesis</h3>
          <p className="text-sm text-blue-700">
            This section helps you interpret your carbon footprint results and identify key areas 
            for emissions reduction. Your insights will form the foundation for your carbon 
            reduction strategy.
          </p>
        </div>

        <Card className="bg-slate-50">
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <h4 className="text-sm font-medium text-gray-500">Scope 1 Emissions</h4>
                <p className="text-2xl font-bold">{form.watch("scope1Emissions") || "0"} <span className="text-sm font-normal">tCO₂e</span></p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500">Scope 2 Emissions</h4>
                <p className="text-2xl font-bold">{form.watch("scope2Emissions") || "0"} <span className="text-sm font-normal">tCO₂e</span></p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500">Scope 3 Emissions</h4>
                <p className="text-2xl font-bold">{form.watch("scope3Emissions") || "0"} <span className="text-sm font-normal">tCO₂e</span></p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500">Total Emissions</h4>
                <p className="text-2xl font-bold">{calculateTotal()} <span className="text-sm font-normal">tCO₂e</span></p>
              </div>
            </div>
            
            {(form.watch("scope1Emissions") === "" && form.watch("scope2Emissions") === "" && form.watch("scope3Emissions") === "") && (
              <div className="flex items-center text-amber-700 text-sm mb-4">
                <AlertCircle className="h-4 w-4 mr-2" />
                <p>No emissions data has been entered yet. Complete the Carbon Data section first.</p>
              </div>
            )}
          </CardContent>
        </Card>

        <FormField
          control={form.control}
          name="emissionHotspots"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Key Emission Hotspots</FormLabel>
              <FormDescription>
                Identify the areas or activities with the highest emissions in your organization
              </FormDescription>
              <FormControl>
                <Textarea 
                  placeholder="e.g., Business travel accounts for 40% of our total emissions..." 
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
          name="reductionOpportunities"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Reduction Opportunities</FormLabel>
              <FormDescription>
                What are the main opportunities for reducing your carbon footprint?
              </FormDescription>
              <FormControl>
                <Textarea 
                  placeholder="e.g., Switching to renewable electricity could reduce our Scope 2 emissions by 90%..." 
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
          name="benchmarkComparison"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Benchmark Comparison</FormLabel>
              <FormDescription>
                How do your emissions compare to industry benchmarks or previous years?
              </FormDescription>
              <FormControl>
                <Textarea 
                  placeholder="e.g., Our emissions per employee are 5 tCO₂e, which is 20% below industry average..." 
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
          name="recommendedActions"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Recommended Next Steps</FormLabel>
              <FormDescription>
                What actions should be prioritized based on your carbon evaluation results?
              </FormDescription>
              <FormControl>
                <Textarea 
                  placeholder="e.g., 1. Switch to renewable energy provider, 2. Implement travel policy..." 
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
            Next: Methodology
          </Button>
        </div>
      </form>
    </Form>
  );
}
