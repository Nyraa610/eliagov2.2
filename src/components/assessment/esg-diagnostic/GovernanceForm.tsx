
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { UseFormReturn } from "react-hook-form";
import { ESGFormValues } from "./ESGFormSchema";
import { ArrowRight, ArrowLeft, ShieldCheck } from "lucide-react";

interface GovernanceFormProps {
  form: UseFormReturn<ESGFormValues>;
  onNext: () => void;
  onPrev: () => void;
}

export function GovernanceForm({ form, onNext, onPrev }: GovernanceFormProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-medium flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-purple-500" />
          Governance
        </h3>
        <p className="text-sm text-muted-foreground">
          Tell us about your company's governance structure and ethical practices.
        </p>
      </div>
      
      <FormField
        control={form.control}
        name="independentBoard"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Independent Board Oversight</FormLabel>
            <FormDescription>
              Is there an independent board overseeing governance practices? Describe your company's board structure.
            </FormDescription>
            <FormControl>
              <Textarea 
                placeholder="E.g., board composition, independent directors, oversight committees..." 
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
        name="transparencyPractices"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Transparency Practices</FormLabel>
            <FormDescription>
              How does your company ensure transparency with stakeholders and the public?
            </FormDescription>
            <FormControl>
              <Textarea 
                placeholder="E.g., public reporting, stakeholder communication channels, disclosure practices..." 
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
        name="ethicalDecisionMaking"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Ethical Decision Making</FormLabel>
            <FormDescription>
              Describe how your company ensures ethical decision-making and business conduct
            </FormDescription>
            <FormControl>
              <Textarea 
                placeholder="E.g., code of conduct, ethics policies, anti-corruption measures..." 
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
