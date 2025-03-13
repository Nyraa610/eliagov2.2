
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { UseFormReturn } from "react-hook-form";
import { ESGFormValues } from "./ESGFormSchema";
import { ArrowRight, ArrowLeft, Users } from "lucide-react";

interface SocialFormProps {
  form: UseFormReturn<ESGFormValues>;
  onNext: () => void;
  onPrev: () => void;
}

export function SocialForm({ form, onNext, onPrev }: SocialFormProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-medium flex items-center gap-2">
          <Users className="h-5 w-5 text-blue-500" />
          Social Responsibility
        </h3>
        <p className="text-sm text-muted-foreground">
          Tell us about your company's efforts to promote social responsibility and community engagement.
        </p>
      </div>
      
      <FormField
        control={form.control}
        name="employeeWellbeing"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Employee Wellbeing</FormLabel>
            <FormDescription>
              How does your company ensure employee wellbeing, safety, training, and diversity?
            </FormDescription>
            <FormControl>
              <Textarea 
                placeholder="E.g., health and safety programs, professional development initiatives, work-life balance policies..." 
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
        name="communityEngagement"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Community Engagement</FormLabel>
            <FormDescription>
              Describe your engagement with local communities or stakeholders
            </FormDescription>
            <FormControl>
              <Textarea 
                placeholder="E.g., charitable partnerships, community programs, stakeholder consultations..." 
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
        name="diversityInitiatives"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Diversity & Inclusion</FormLabel>
            <FormDescription>
              Describe initiatives to promote diversity, equity, and inclusion in your company
            </FormDescription>
            <FormControl>
              <Textarea 
                placeholder="E.g., diversity hiring practices, inclusion programs, equal opportunity policies..." 
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
