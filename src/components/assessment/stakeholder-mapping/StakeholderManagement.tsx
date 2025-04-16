
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { ChevronRight, ListChecks } from "lucide-react";
import { stakeholderService } from "@/services/stakeholderService";

const formSchema = z.object({
  engagementFrequency: z.enum([
    "never", "rarely", "occasionally", "regularly", "continuously"
  ]),
  engagementMethods: z.enum([
    "none", "minimal", "basic", "comprehensive", "integrated"
  ]),
  stakeholderInfluence: z.enum([
    "notConsidered", "informally", "partially", "considered", "integral"
  ]),
  documentsProcesses: z.enum([
    "none", "minimal", "some", "detailed", "comprehensive"
  ]),
  stakeholderFeedback: z.enum([
    "none", "minimal", "structured", "comprehensive", "continuous"
  ]),
  managementChallenges: z.string().min(1, "Please describe your challenges"),
});

type StakeholderManagementProps = {
  onComplete: () => void;
};

export function StakeholderManagement({ onComplete }: StakeholderManagementProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      engagementFrequency: "occasionally",
      engagementMethods: "basic",
      stakeholderInfluence: "partially",
      documentsProcesses: "some",
      stakeholderFeedback: "structured",
      managementChallenges: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    try {
      await stakeholderService.saveManagementPractices(values);
      toast.success("Management practices saved");
      onComplete();
    } catch (error) {
      console.error("Error saving management practices:", error);
      toast.error("Failed to save management practices");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ListChecks className="h-5 w-5 text-primary" /> Stakeholder Management Practices
          </CardTitle>
          <CardDescription>
            Assess how your organization currently manages stakeholder relationships
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="engagementFrequency"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>How frequently does your organization engage with stakeholders?</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-1"
                      >
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="never" />
                          </FormControl>
                          <FormLabel className="font-normal">Never or very rarely</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="rarely" />
                          </FormControl>
                          <FormLabel className="font-normal">Rarely (once a year or less)</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="occasionally" />
                          </FormControl>
                          <FormLabel className="font-normal">Occasionally (a few times per year)</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="regularly" />
                          </FormControl>
                          <FormLabel className="font-normal">Regularly (quarterly or monthly)</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="continuously" />
                          </FormControl>
                          <FormLabel className="font-normal">Continuously (ongoing dialogue)</FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="engagementMethods"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>What methods does your organization use to engage stakeholders?</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-1"
                      >
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="none" />
                          </FormControl>
                          <FormLabel className="font-normal">No formal engagement methods</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="minimal" />
                          </FormControl>
                          <FormLabel className="font-normal">Minimal (basic surveys or occasional meetings)</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="basic" />
                          </FormControl>
                          <FormLabel className="font-normal">Basic (regular surveys, focus groups, periodic consultations)</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="comprehensive" />
                          </FormControl>
                          <FormLabel className="font-normal">Comprehensive (multiple channels including digital platforms, workshops, advisory panels)</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="integrated" />
                          </FormControl>
                          <FormLabel className="font-normal">Integrated (sophisticated multi-channel approach with formal stakeholder inclusion in processes)</FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="stakeholderInfluence"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>How are stakeholder views considered in decision-making?</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-1"
                      >
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="notConsidered" />
                          </FormControl>
                          <FormLabel className="font-normal">Not considered in decision-making</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="informally" />
                          </FormControl>
                          <FormLabel className="font-normal">Informally considered by managers</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="partially" />
                          </FormControl>
                          <FormLabel className="font-normal">Partially considered in some decisions</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="considered" />
                          </FormControl>
                          <FormLabel className="font-normal">Formally considered in most strategic decisions</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="integral" />
                          </FormControl>
                          <FormLabel className="font-normal">Integral to all decision-making processes</FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="documentsProcesses"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>How well documented are your stakeholder management processes?</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-1"
                      >
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="none" />
                          </FormControl>
                          <FormLabel className="font-normal">No documentation</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="minimal" />
                          </FormControl>
                          <FormLabel className="font-normal">Minimal (basic lists of stakeholders only)</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="some" />
                          </FormControl>
                          <FormLabel className="font-normal">Some documentation (stakeholder lists and some engagement records)</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="detailed" />
                          </FormControl>
                          <FormLabel className="font-normal">Detailed documentation (formal processes, engagement records, response tracking)</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="comprehensive" />
                          </FormControl>
                          <FormLabel className="font-normal">Comprehensive documentation (digital system with full engagement history, issues, responses, and outcomes)</FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="stakeholderFeedback"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>How does your organization handle stakeholder feedback?</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-1"
                      >
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="none" />
                          </FormControl>
                          <FormLabel className="font-normal">No formal feedback collection</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="minimal" />
                          </FormControl>
                          <FormLabel className="font-normal">Minimal collection without systematic response</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="structured" />
                          </FormControl>
                          <FormLabel className="font-normal">Structured collection with some response procedures</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="comprehensive" />
                          </FormControl>
                          <FormLabel className="font-normal">Comprehensive collection and response system</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="continuous" />
                          </FormControl>
                          <FormLabel className="font-normal">Continuous feedback loops integrated into decision-making</FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="managementChallenges"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>What challenges does your organization face in stakeholder management?</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe challenges such as resource constraints, communication barriers, conflicting interests, etc."
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end">
                <Button type="submit" disabled={isSubmitting} className="flex items-center gap-2">
                  Continue <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
