
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
import { ArrowLeft, Building, Car, Factory, Footprints, Leaf } from "lucide-react";
import { Link } from "react-router-dom";

const formSchema = z.object({
  companyName: z.string().min(2, {
    message: "Company name must be at least 2 characters.",
  }),
  yearOfEvaluation: z.string().min(4, {
    message: "Please enter a valid year.",
  }),
  scope1Emissions: z.string().optional(),
  scope2Emissions: z.string().optional(),
  scope3Emissions: z.string().optional(),
  transportationUsage: z.string().optional(),
});

export default function CarbonEvaluation() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("company-info");
  
  // Form definition
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      companyName: "",
      yearOfEvaluation: new Date().getFullYear().toString(),
      scope1Emissions: "",
      scope2Emissions: "",
      scope3Emissions: "",
      transportationUsage: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
    // Here we would save the data and potentially navigate to the next step
  }
  
  const tabs = [
    { id: "company-info", label: "Company Information", icon: <Building className="h-4 w-4 mr-2" /> },
    { id: "direct-emissions", label: "Direct Emissions", icon: <Factory className="h-4 w-4 mr-2" /> },
    { id: "indirect-emissions", label: "Indirect Emissions", icon: <Leaf className="h-4 w-4 mr-2" /> },
    { id: "transportation", label: "Transportation", icon: <Car className="h-4 w-4 mr-2" /> }
  ];

  return (
    <UserLayout title={t("assessment.carbonEvaluation.title")}>
      <div className="mb-6">
        <Link to="/assessment" className="text-primary hover:underline flex items-center mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to Assessment
        </Link>
        <p className="text-gray-600">
          {t("assessment.carbonEvaluation.description")}
        </p>
      </div>
      
      <AssessmentBase 
        title={t("assessment.carbonEvaluation.title")} 
        description={t("assessment.carbonEvaluation.description")}
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
                  name="yearOfEvaluation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Year of Evaluation</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., 2023" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex justify-end">
                  <Button type="button" onClick={() => setActiveTab("direct-emissions")}>
                    Next: Direct Emissions
                  </Button>
                </div>
              </form>
            </Form>
          </TabsContent>
          
          <TabsContent value="direct-emissions" className="space-y-4">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="scope1Emissions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Scope 1 Emissions (Direct)</FormLabel>
                      <FormDescription>
                        Direct emissions from owned or controlled sources (in tCO2e)
                      </FormDescription>
                      <FormControl>
                        <Input placeholder="Enter amount in tCO2e" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex justify-between">
                  <Button type="button" variant="outline" onClick={() => setActiveTab("company-info")}>
                    Previous
                  </Button>
                  <Button type="button" onClick={() => setActiveTab("indirect-emissions")}>
                    Next: Indirect Emissions
                  </Button>
                </div>
              </form>
            </Form>
          </TabsContent>
          
          <TabsContent value="indirect-emissions" className="space-y-4">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="scope2Emissions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Scope 2 Emissions (Indirect)</FormLabel>
                      <FormDescription>
                        Indirect emissions from generation of purchased energy (in tCO2e)
                      </FormDescription>
                      <FormControl>
                        <Input placeholder="Enter amount in tCO2e" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="scope3Emissions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Scope 3 Emissions (Value Chain)</FormLabel>
                      <FormDescription>
                        All other indirect emissions in the value chain (in tCO2e)
                      </FormDescription>
                      <FormControl>
                        <Input placeholder="Enter amount in tCO2e" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex justify-between">
                  <Button type="button" variant="outline" onClick={() => setActiveTab("direct-emissions")}>
                    Previous
                  </Button>
                  <Button type="button" onClick={() => setActiveTab("transportation")}>
                    Next: Transportation
                  </Button>
                </div>
              </form>
            </Form>
          </TabsContent>
          
          <TabsContent value="transportation" className="space-y-4">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="transportationUsage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Transportation Usage</FormLabel>
                      <FormDescription>
                        Describe your company's transportation usage and related emissions
                      </FormDescription>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe company vehicles, employee commuting, business travel..." 
                          className="min-h-[150px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex justify-between">
                  <Button type="button" variant="outline" onClick={() => setActiveTab("indirect-emissions")}>
                    Previous
                  </Button>
                  <Button type="submit">
                    Submit Carbon Evaluation
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
