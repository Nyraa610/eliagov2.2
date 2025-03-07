
import { useState } from "react";
import { UserLayout } from "@/components/user/UserLayout";
import { AssessmentBase } from "@/components/assessment/AssessmentBase";
import { useTranslation } from "react-i18next";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { ArrowLeft, ClipboardList, Users, Building, LineChart } from "lucide-react";
import { Link } from "react-router-dom";

const formSchema = z.object({
  companyName: z.string().min(2, {
    message: "Company name must be at least 2 characters.",
  }),
  industry: z.string().min(2, {
    message: "Industry must be at least 2 characters.",
  }),
  employeeCount: z.string().min(1, {
    message: "Please select the number of employees.",
  }),
  currentRSEPractices: z.string().optional(),
  mainChallenges: z.string().optional(),
});

export default function RSEDiagnostic() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("company-info");
  
  // Form definition
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      companyName: "",
      industry: "",
      employeeCount: "",
      currentRSEPractices: "",
      mainChallenges: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
    // Here we would save the data and potentially navigate to the next step
  }
  
  const tabs = [
    { id: "company-info", label: "Company Information", icon: <Building className="h-4 w-4 mr-2" /> },
    { id: "practices", label: "Current Practices", icon: <ClipboardList className="h-4 w-4 mr-2" /> },
    { id: "stakeholders", label: "Stakeholders", icon: <Users className="h-4 w-4 mr-2" /> },
    { id: "challenges", label: "Challenges & Goals", icon: <LineChart className="h-4 w-4 mr-2" /> }
  ];

  return (
    <UserLayout title={t("assessment.diagnosticRSE.title")}>
      <div className="mb-6">
        <Link to="/assessment" className="text-primary hover:underline flex items-center mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to Assessment
        </Link>
        <p className="text-gray-600">
          {t("assessment.diagnosticRSE.description")}
        </p>
      </div>
      
      <AssessmentBase 
        title={t("assessment.diagnosticRSE.title")} 
        description={t("assessment.diagnosticRSE.description")}
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
          
          <TabsContent value="company-info" className="space-y-4">
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
                  name="industry"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Industry</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Manufacturing, Retail, Services" {...field} />
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
                            <FormLabel className="font-normal">1-10</FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="11-50" />
                            </FormControl>
                            <FormLabel className="font-normal">11-50</FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="51-250" />
                            </FormControl>
                            <FormLabel className="font-normal">51-250</FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="251+" />
                            </FormControl>
                            <FormLabel className="font-normal">251+</FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex justify-end">
                  <Button type="button" onClick={() => setActiveTab("practices")}>
                    Next: Current Practices
                  </Button>
                </div>
              </form>
            </Form>
          </TabsContent>
          
          <TabsContent value="practices" className="space-y-4">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="currentRSEPractices"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current RSE/ESG Practices</FormLabel>
                      <FormDescription>
                        Describe any existing sustainability or social responsibility initiatives
                      </FormDescription>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe your current sustainability practices..." 
                          className="min-h-[150px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex justify-between">
                  <Button type="button" variant="outline" onClick={() => setActiveTab("company-info")}>
                    Previous
                  </Button>
                  <Button type="button" onClick={() => setActiveTab("stakeholders")}>
                    Next: Stakeholders
                  </Button>
                </div>
              </form>
            </Form>
          </TabsContent>
          
          <TabsContent value="stakeholders" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Stakeholder Mapping</CardTitle>
                <CardDescription>
                  Identify and prioritize your key stakeholders for the RSE assessment
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  This section will be expanded with stakeholder mapping tools.
                </p>
                
                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setActiveTab("practices")}>
                    Previous
                  </Button>
                  <Button onClick={() => setActiveTab("challenges")}>
                    Next: Challenges & Goals
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="challenges" className="space-y-4">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="mainChallenges"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Main Challenges & Goals</FormLabel>
                      <FormDescription>
                        What are your main sustainability challenges and what goals do you hope to achieve?
                      </FormDescription>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe your challenges and goals..." 
                          className="min-h-[150px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex justify-between">
                  <Button type="button" variant="outline" onClick={() => setActiveTab("stakeholders")}>
                    Previous
                  </Button>
                  <Button type="submit">
                    Submit Diagnostic
                  </Button>
                </div>
              </form>
            </Form>
          </TabsContent>
        </Tabs>
      </AssessmentBase>
    </UserLayout>
  );
}
