
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { departments, getPersonaOptions } from "./departmentOptions";
import { z } from "zod";
import { UseFormReturn } from "react-hook-form";
import { RegistrationFormValues } from "@/hooks/useRegistration";

export interface AdditionalInfoFormProps {
  form: UseFormReturn<RegistrationFormValues, any, undefined>;
  onSubmit: (values: Partial<RegistrationFormValues>) => void;
  onBack: () => void;
  isLoading: boolean;
}

export const AdditionalInfoForm = ({
  form,
  onSubmit,
  onBack,
  isLoading
}: AdditionalInfoFormProps) => {
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="text-sm text-gray-500 mb-4">
          <p>Tell us a bit more about yourself to help us personalize your experience</p>
        </div>
        
        <FormField
          control={form.control}
          name="department"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Department</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your department" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept.value} value={dept.value}>
                      {dept.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="persona"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Your Role</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                defaultValue={field.value}
                disabled={!form.watch("department")}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={form.watch("department") ? "Select your role" : "Please select a department first"} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {getPersonaOptions(form.watch("department")).map((role) => (
                    <SelectItem key={role.value} value={role.value}>
                      {role.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="marketingConsent"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 mt-6">
              <FormControl>
                <Checkbox 
                  checked={field.value}
                  onCheckedChange={field.onChange} 
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel className="font-normal text-sm">
                  I agree to receive information and updates about ELIA GO products and services
                </FormLabel>
              </div>
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="termsConsent"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox 
                  checked={field.value}
                  onCheckedChange={field.onChange} 
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel className="font-normal text-sm">
                  I accept the <a href="/terms" className="text-primary underline">Terms and Conditions</a> and <a href="/privacy" className="text-primary underline">Privacy Policy</a>
                </FormLabel>
                <FormMessage />
              </div>
            </FormItem>
          )}
        />
        
        <div className="flex flex-row gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onBack} className="w-1/2">
            Back
          </Button>
          <Button type="submit" className="w-1/2" disabled={isLoading}>
            {isLoading ? "Creating account..." : "Create account"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
