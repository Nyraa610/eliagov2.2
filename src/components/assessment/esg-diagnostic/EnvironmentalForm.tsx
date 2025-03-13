
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { UseFormReturn } from "react-hook-form";
import { ESGFormValues } from "./ESGFormSchema";
import { ArrowRight, ArrowLeft, Leaf } from "lucide-react";

interface EnvironmentalFormProps {
  form: UseFormReturn<ESGFormValues>;
  onNext: () => void;
  onPrev: () => void;
}

export function EnvironmentalForm({ form, onNext, onPrev }: EnvironmentalFormProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-medium flex items-center gap-2">
          <Leaf className="h-5 w-5 text-green-500" />
          Environmental Practices
        </h3>
        <p className="text-sm text-muted-foreground">
          Tell us about your company's efforts to manage environmental impact and resource use.
        </p>
      </div>
      
      <FormField
        control={form.control}
        name="wasteManagement"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Waste Management & Emissions</FormLabel>
            <FormDescription>
              Describe your company's efforts to manage waste, reduce emissions, or minimize environmental impact
            </FormDescription>
            <FormControl>
              <Textarea 
                placeholder="E.g., recycling programs, waste reduction initiatives, pollution prevention measures..." 
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
        name="carbonFootprint"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Carbon Footprint</FormLabel>
            <FormDescription>
              Do you measure your carbon footprint (e.g., Bilan Carbone)? Provide details if applicable.
            </FormDescription>
            <FormControl>
              <Textarea 
                placeholder="E.g., measurement methods, results, reduction targets..." 
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
        name="renewableEnergy"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Renewable Energy & Resource Efficiency</FormLabel>
            <FormDescription>
              Describe any initiatives to use renewable energy or improve resource efficiency
            </FormDescription>
            <FormControl>
              <Textarea 
                placeholder="E.g., solar panels, energy-efficient equipment, water conservation..." 
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
        <Button type="button" onClick={onNext} className="gap-1">
          Next <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
