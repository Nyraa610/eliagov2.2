
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
import { Slider } from "@/components/ui/slider";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { ArrowLeft, Layers, Users, TrendingUp, BarChart3 } from "lucide-react";
import { Link } from "react-router-dom";

const formSchema = z.object({
  companyName: z.string().min(2, {
    message: "Company name must be at least 2 characters.",
  }),
  materialIssues: z.string().min(10, {
    message: "Please describe your material issues in detail.",
  }),
  impactOnBusiness: z.coerce.number().min(0).max(10),
  impactOnStakeholders: z.coerce.number().min(0).max(10),
  stakeholderFeedback: z.string().optional(),
});

export default function MaterialityAnalysis() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("identify");
  
  // Form definition
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      companyName: "",
      materialIssues: "",
      impactOnBusiness: 5,
      impactOnStakeholders: 5,
      stakeholderFeedback: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
    // Here we would save the data and potentially navigate to the next step
  }
  
  const tabs = [
    { id: "identify", label: "Identify Issues", icon: <Layers className="h-4 w-4 mr-2" /> },
    { id: "assess", label: "Assess Impact", icon: <BarChart3 className="h-4 w-4 mr-2" /> },
    { id: "stakeholders", label: "Stakeholder Input", icon: <Users className="h-4 w-4 mr-2" /> },
    { id: "prioritize", label: "Prioritize", icon: <TrendingUp className="h-4 w-4 mr-2" /> }
  ];

  return (
    <UserLayout title={t("assessment.materialityAnalysis.title")}>
      <div className="mb-6">
        <Link to="/assessment" className="text-primary hover:underline flex items-center mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to Assessment
        </Link>
        <p className="text-gray-600">
          {t("assessment.materialityAnalysis.description")}
        </p>
      </div>
      
      <AssessmentBase 
        title={t("assessment.materialityAnalysis.title")} 
        description={t("assessment.materialityAnalysis.description")}
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
          
          <TabsContent value="identify" className="space-y-4">
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
                  name="materialIssues"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Material Issues</FormLabel>
                      <FormDescription>
                        Identify and describe the key environmental, social, and governance issues relevant to your business
                      </FormDescription>
                      <FormControl>
                        <Textarea 
                          placeholder="List and describe material issues..." 
                          className="min-h-[150px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex justify-end">
                  <Button type="button" onClick={() => setActiveTab("assess")}>
                    Next: Assess Impact
                  </Button>
                </div>
              </form>
            </Form>
          </TabsContent>
          
          <TabsContent value="assess" className="space-y-4">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="impactOnBusiness"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Impact on Business (0-10)</FormLabel>
                      <FormDescription>
                        Rate how these issues impact your business operations, revenue, and strategy
                      </FormDescription>
                      <FormControl>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span>Low Impact (0)</span>
                            <span>High Impact (10)</span>
                          </div>
                          <Slider
                            min={0}
                            max={10}
                            step={1}
                            defaultValue={[field.value]}
                            onValueChange={(vals) => field.onChange(vals[0])}
                            aria-label="Impact on business"
                          />
                          <div className="text-center font-medium">
                            Current rating: {field.value}
                          </div>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex justify-between">
                  <Button type="button" variant="outline" onClick={() => setActiveTab("identify")}>
                    Previous
                  </Button>
                  <Button type="button" onClick={() => setActiveTab("stakeholders")}>
                    Next: Stakeholder Input
                  </Button>
                </div>
              </form>
            </Form>
          </TabsContent>
          
          <TabsContent value="stakeholders" className="space-y-4">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="impactOnStakeholders"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Impact on Stakeholders (0-10)</FormLabel>
                      <FormDescription>
                        Rate how these issues impact your stakeholders (customers, employees, community, etc.)
                      </FormDescription>
                      <FormControl>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span>Low Impact (0)</span>
                            <span>High Impact (10)</span>
                          </div>
                          <Slider
                            min={0}
                            max={10}
                            step={1}
                            defaultValue={[field.value]}
                            onValueChange={(vals) => field.onChange(vals[0])}
                            aria-label="Impact on stakeholders"
                          />
                          <div className="text-center font-medium">
                            Current rating: {field.value}
                          </div>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="stakeholderFeedback"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Stakeholder Feedback</FormLabel>
                      <FormDescription>
                        Summarize feedback collected from key stakeholders regarding material issues
                      </FormDescription>
                      <FormControl>
                        <Textarea 
                          placeholder="Enter stakeholder feedback..." 
                          className="min-h-[150px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex justify-between">
                  <Button type="button" variant="outline" onClick={() => setActiveTab("assess")}>
                    Previous
                  </Button>
                  <Button type="button" onClick={() => setActiveTab("prioritize")}>
                    Next: Prioritize
                  </Button>
                </div>
              </form>
            </Form>
          </TabsContent>
          
          <TabsContent value="prioritize" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Materiality Matrix</CardTitle>
                <CardDescription>
                  Based on your inputs, we've generated a materiality matrix to help prioritize your ESG issues
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-slate-100 rounded-lg p-8 flex items-center justify-center">
                  <p className="text-center text-muted-foreground">
                    The materiality matrix visualization will be displayed here, plotting business impact versus stakeholder impact.
                  </p>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={() => setActiveTab("stakeholders")}>
                  Previous
                </Button>
                <Button onClick={form.handleSubmit(onSubmit)}>
                  Complete Analysis
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </AssessmentBase>
    </UserLayout>
  );
}
