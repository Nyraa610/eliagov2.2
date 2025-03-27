
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { UseFormReturn } from "react-hook-form";
import { CarbonEvaluationFormValues } from "../formSchema";
import { Separator } from "@/components/ui/separator";

interface CarbonDataFormProps {
  form: UseFormReturn<CarbonEvaluationFormValues>;
  onPrevious: () => void;
  onNext: () => void;
}

export function CarbonDataForm({ form, onPrevious, onNext }: CarbonDataFormProps) {
  return (
    <Form {...form}>
      <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
        <div className="bg-blue-50 border border-blue-100 rounded-md p-4 mb-6">
          <h3 className="text-lg font-medium text-blue-800 mb-2">Carbon Data Collection</h3>
          <p className="text-sm text-blue-700">
            This section focuses on gathering and organizing your emissions data. 
            Aim to provide your best available data - estimates are acceptable for 
            your first evaluation if precise data isn't available.
          </p>
        </div>

        <div>
          <h3 className="font-medium text-lg mb-4">Direct Emissions (Scope 1)</h3>
          
          <FormField
            control={form.control}
            name="fuelConsumption"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fuel Consumption</FormLabel>
                <FormDescription>
                  Include natural gas, diesel, petrol, etc. used in company facilities and vehicles
                </FormDescription>
                <FormControl>
                  <Textarea 
                    placeholder="e.g., Natural gas: 10,000 m³, Diesel: 5,000 liters..." 
                    className="min-h-[80px]"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="refrigerantEmissions"
            render={({ field }) => (
              <FormItem className="mt-4">
                <FormLabel>Refrigerant Leakage</FormLabel>
                <FormDescription>
                  Emissions from refrigeration and air conditioning equipment
                </FormDescription>
                <FormControl>
                  <Input placeholder="e.g., R-410A: 2 kg" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="scope1Emissions"
            render={({ field }) => (
              <FormItem className="mt-4">
                <FormLabel>Total Scope 1 Emissions (if known)</FormLabel>
                <FormDescription>
                  Total direct emissions in tCO₂e (if already calculated)
                </FormDescription>
                <FormControl>
                  <Input placeholder="Total in tCO₂e" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <Separator />
        
        <div>
          <h3 className="font-medium text-lg mb-4">Indirect Energy Emissions (Scope 2)</h3>
          
          <FormField
            control={form.control}
            name="electricityConsumption"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Electricity Consumption</FormLabel>
                <FormDescription>
                  Total electricity purchased from the grid
                </FormDescription>
                <FormControl>
                  <Input placeholder="e.g., 500,000 kWh" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="heatingSteamConsumption"
            render={({ field }) => (
              <FormItem className="mt-4">
                <FormLabel>Purchased Heating/Cooling/Steam</FormLabel>
                <FormDescription>
                  Any heating, cooling or steam purchased from external providers
                </FormDescription>
                <FormControl>
                  <Input placeholder="e.g., District heating: 200 MWh" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="scope2Emissions"
            render={({ field }) => (
              <FormItem className="mt-4">
                <FormLabel>Total Scope 2 Emissions (if known)</FormLabel>
                <FormDescription>
                  Total energy indirect emissions in tCO₂e (if already calculated)
                </FormDescription>
                <FormControl>
                  <Input placeholder="Total in tCO₂e" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <Separator />
        
        <div>
          <h3 className="font-medium text-lg mb-4">Value Chain Emissions (Scope 3)</h3>
          
          <FormField
            control={form.control}
            name="purchasedGoods"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Purchased Goods and Services</FormLabel>
                <FormDescription>
                  Information about major purchases and their estimated emissions
                </FormDescription>
                <FormControl>
                  <Textarea 
                    placeholder="e.g., Raw materials: 1,000 tons, IT services..." 
                    className="min-h-[80px]"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="businessTravel"
            render={({ field }) => (
              <FormItem className="mt-4">
                <FormLabel>Business Travel</FormLabel>
                <FormDescription>
                  Details of employee business travel by mode of transport
                </FormDescription>
                <FormControl>
                  <Textarea 
                    placeholder="e.g., Flights: 50,000 km, Train travel: 10,000 km..." 
                    className="min-h-[80px]"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="employeeCommuting"
            render={({ field }) => (
              <FormItem className="mt-4">
                <FormLabel>Employee Commuting</FormLabel>
                <FormDescription>
                  Information about how employees travel to work
                </FormDescription>
                <FormControl>
                  <Textarea 
                    placeholder="e.g., 50 employees commuting by car, 20 by public transport..." 
                    className="min-h-[80px]"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="wasteGenerated"
            render={({ field }) => (
              <FormItem className="mt-4">
                <FormLabel>Waste Generated</FormLabel>
                <FormDescription>
                  Information about waste generated by operations
                </FormDescription>
                <FormControl>
                  <Textarea 
                    placeholder="e.g., General waste: 10 tons, Recycled: 5 tons..." 
                    className="min-h-[80px]"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="scope3Emissions"
            render={({ field }) => (
              <FormItem className="mt-4">
                <FormLabel>Total Scope 3 Emissions (if known)</FormLabel>
                <FormDescription>
                  Total value chain emissions in tCO₂e (if already calculated)
                </FormDescription>
                <FormControl>
                  <Input placeholder="Total in tCO₂e" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="flex justify-between">
          <Button type="button" variant="outline" onClick={onPrevious}>
            Previous
          </Button>
          <Button type="button" onClick={onNext}>
            Next: Synthesis
          </Button>
        </div>
      </form>
    </Form>
  );
}
