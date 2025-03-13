
import { useEffect } from "react";
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { UseFormReturn } from "react-hook-form";
import { ESGFormValues } from "./ESGFormSchema";
import { ArrowRight } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface CompanyContextFormProps {
  form: UseFormReturn<ESGFormValues>;
  onNext: () => void;
}

export function CompanyContextForm({ form, onNext }: CompanyContextFormProps) {
  useEffect(() => {
    // Get user's company information when component mounts
    const getUserCompany = async () => {
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        
        if (sessionData.session) {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('*, companies:company_id(*)')
            .eq('id', sessionData.session.user.id)
            .single();
          
          if (profileData?.companies?.name) {
            // Set company name in the form
            form.setValue('companyName', profileData.companies.name);
          }
        }
      } catch (error) {
        console.error("Error fetching user company:", error);
      }
    };
    
    getUserCompany();
  }, [form]);

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Company Context</h3>
        <p className="text-sm text-muted-foreground">
          Let's understand your company's context to better evaluate your ESG practices.
        </p>
      </div>
      
      <FormField
        control={form.control}
        name="industry"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Industry</FormLabel>
            <FormDescription>
              Specify the industry or sector your company operates in
            </FormDescription>
            <FormControl>
              <Input placeholder="e.g., Manufacturing, Technology, Services" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="employeeCount"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Number of Employees</FormLabel>
            <FormDescription>
              This helps us tailor recommendations based on your company size
            </FormDescription>
            <FormControl>
              <RadioGroup 
                onValueChange={field.onChange} 
                defaultValue={field.value}
                className="flex flex-col space-y-1"
              >
                <FormItem className="flex items-center space-x-3 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="1-10" />
                  </FormControl>
                  <FormLabel className="font-normal">1-10 (Micro enterprise)</FormLabel>
                </FormItem>
                <FormItem className="flex items-center space-x-3 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="11-50" />
                  </FormControl>
                  <FormLabel className="font-normal">11-50 (Small enterprise)</FormLabel>
                </FormItem>
                <FormItem className="flex items-center space-x-3 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="51-250" />
                  </FormControl>
                  <FormLabel className="font-normal">51-250 (Medium enterprise)</FormLabel>
                </FormItem>
                <FormItem className="flex items-center space-x-3 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="251-1000" />
                  </FormControl>
                  <FormLabel className="font-normal">251-1000 (Large enterprise)</FormLabel>
                </FormItem>
                <FormItem className="flex items-center space-x-3 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="1000+" />
                  </FormControl>
                  <FormLabel className="font-normal">1000+ (Very large enterprise)</FormLabel>
                </FormItem>
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <div className="flex justify-end">
        <Button type="button" onClick={onNext} className="gap-1">
          Next <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
