
import { useState } from "react";
import { UserLayout } from "@/components/user/UserLayout";
import { AssessmentBase } from "@/components/assessment/AssessmentBase";
import { useTranslation } from "react-i18next";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { ArrowLeft, CalendarClock, Check, Lightbulb, Route, Target } from "lucide-react";
import { Link } from "react-router-dom";

const formSchema = z.object({
  companyName: z.string().min(2, {
    message: "Company name must be at least 2 characters.",
  }),
  shortTermGoals: z.string().min(10, {
    message: "Please describe your short-term goals in detail.",
  }),
  midTermGoals: z.string().min(10, {
    message: "Please describe your mid-term goals in detail.",
  }),
  longTermGoals: z.string().min(10, {
    message: "Please describe your long-term goals in detail.",
  }),
  keyInitiatives: z.string().min(10, {
    message: "Please describe your key initiatives in detail.",
  }),
  timeline: z.string().min(10, {
    message: "Please provide your implementation timeline.",
  }),
});

export default function ActionPlan() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("goals");
  
  // Form definition
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      companyName: "",
      shortTermGoals: "",
      midTermGoals: "",
      longTermGoals: "",
      keyInitiatives: "",
      timeline: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
    // Here we would save the data and potentially navigate to the next step
  }
  
  const tabs = [
    { id: "goals", label: "ESG Goals", icon: <Target className="h-4 w-4 mr-2" /> },
    { id: "initiatives", label: "Key Initiatives", icon: <Lightbulb className="h-4 w-4 mr-2" /> },
    { id: "timeline", label: "Timeline", icon: <CalendarClock className="h-4 w-4 mr-2" /> },
    { id: "review", label: "Review & Submit", icon: <Check className="h-4 w-4 mr-2" /> }
  ];

  return (
    <UserLayout title={t("assessment.actionPlan.title")}>
      <div className="mb-6">
        <Link to="/assessment" className="text-primary hover:underline flex items-center mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to Assessment
        </Link>
        <p className="text-gray-600">
          {t("assessment.actionPlan.description")}
        </p>
      </div>
      
      <AssessmentBase 
        title={t("assessment.actionPlan.title")} 
        description={t("assessment.actionPlan.description")}
        status="in-progress"
      >
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 lg:grid-cols-4 mb-6">
            {tabs.map(tab => (
              <TabsTrigger key={tab.id} value={tab.id} className="flex items-center">
                {tab.icon} {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
          
          <TabsContent value="goals" className="space-y-4">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="companyName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your company name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="shortTermGoals"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Short-term ESG Goals (1 year)</FormLabel>
                      <FormDescription>
                        Define your short-term ESG goals and targets for the next year
                      </FormDescription>
                      <FormControl>
                        <Textarea 
                          placeholder="List your short-term goals..." 
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
                  name="midTermGoals"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mid-term ESG Goals (2-3 years)</FormLabel>
                      <FormDescription>
                        Define your mid-term ESG goals and targets for the next 2-3 years
                      </FormDescription>
                      <FormControl>
                        <Textarea 
                          placeholder="List your mid-term goals..." 
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
                  name="longTermGoals"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Long-term ESG Goals (5+ years)</FormLabel>
                      <FormDescription>
                        Define your long-term ESG goals and targets for the next 5+ years
                      </FormDescription>
                      <FormControl>
                        <Textarea 
                          placeholder="List your long-term goals..." 
                          className="min-h-[100px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex justify-end">
                  <Button type="button" onClick={() => setActiveTab("initiatives")}>
                    Next: Key Initiatives
                  </Button>
                </div>
              </form>
            </Form>
          </TabsContent>
          
          <TabsContent value="initiatives" className="space-y-4">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="keyInitiatives"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Key Initiatives</FormLabel>
                      <FormDescription>
                        Outline the key initiatives or projects that will help you achieve your ESG goals
                      </FormDescription>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe your key initiatives..." 
                          className="min-h-[200px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex justify-between">
                  <Button type="button" variant="outline" onClick={() => setActiveTab("goals")}>
                    Previous
                  </Button>
                  <Button type="button" onClick={() => setActiveTab("timeline")}>
                    Next: Timeline
                  </Button>
                </div>
              </form>
            </Form>
          </TabsContent>
          
          <TabsContent value="timeline" className="space-y-4">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="timeline"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Implementation Timeline</FormLabel>
                      <FormDescription>
                        Provide a detailed timeline for implementing your ESG initiatives
                      </FormDescription>
                      <FormControl>
                        <Textarea 
                          placeholder="Detail your implementation timeline..." 
                          className="min-h-[200px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex justify-between">
                  <Button type="button" variant="outline" onClick={() => setActiveTab("initiatives")}>
                    Previous
                  </Button>
                  <Button type="button" onClick={() => setActiveTab("review")}>
                    Next: Review & Submit
                  </Button>
                </div>
              </form>
            </Form>
          </TabsContent>
          
          <TabsContent value="review" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Review Your Action Plan</CardTitle>
                <CardDescription>
                  Review your ESG action plan before submission
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h3 className="font-medium">Short-term Goals (1 year)</h3>
                  <p className="text-sm text-gray-600">{form.watch("shortTermGoals") || "No goals specified"}</p>
                </div>
                
                <div className="space-y-2">
                  <h3 className="font-medium">Mid-term Goals (2-3 years)</h3>
                  <p className="text-sm text-gray-600">{form.watch("midTermGoals") || "No goals specified"}</p>
                </div>
                
                <div className="space-y-2">
                  <h3 className="font-medium">Long-term Goals (5+ years)</h3>
                  <p className="text-sm text-gray-600">{form.watch("longTermGoals") || "No goals specified"}</p>
                </div>
                
                <div className="space-y-2">
                  <h3 className="font-medium">Key Initiatives</h3>
                  <p className="text-sm text-gray-600">{form.watch("keyInitiatives") || "No initiatives specified"}</p>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={() => setActiveTab("timeline")}>
                  Previous
                </Button>
                <Button onClick={form.handleSubmit(onSubmit)}>
                  Submit Action Plan
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </AssessmentBase>
    </UserLayout>
  );
}
