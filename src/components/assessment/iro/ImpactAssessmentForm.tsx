
import { UseFormReturn } from "react-hook-form";
import { IROFormValues } from "./formSchema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";

interface ImpactAssessmentFormProps {
  form: UseFormReturn<IROFormValues>;
  onNext: () => void;
}

export function ImpactAssessmentForm({ form, onNext }: ImpactAssessmentFormProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Impact Assessment</CardTitle>
        <CardDescription>
          Identify and assess the environmental and social impacts of your company's activities
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormField
          control={form.control}
          name="companyActivities"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Describe your company's main activities</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Describe the main activities of your company that have potential environmental or social impacts..." 
                  {...field} 
                  className="min-h-[100px]"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="companyImpacts"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Identify key impacts</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Detail the environmental and social impacts of your activities..." 
                  {...field} 
                  className="min-h-[150px]"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex justify-end">
          <Button onClick={onNext}>
            Next: Risk Assessment
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
