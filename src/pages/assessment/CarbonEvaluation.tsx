
import { useState } from "react";
import { UserLayout } from "@/components/user/UserLayout";
import { AssessmentBase } from "@/components/assessment/AssessmentBase";
import { useTranslation } from "react-i18next";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { ArrowLeft, Truck, Building2, Factory, Lightbulb, Activity } from "lucide-react";
import { Link } from "react-router-dom";
import { Progress } from "@/components/ui/progress";

const formSchema = z.object({
  electricityConsumption: z.string().min(1, {
    message: "Please enter your electricity consumption.",
  }),
  electricityUnit: z.string().min(1, {
    message: "Please select a unit.",
  }),
  heatingConsumption: z.string().min(1, {
    message: "Please enter your heating consumption.",
  }),
  heatingUnit: z.string().min(1, {
    message: "Please select a unit.",
  }),
  vehicleFuel: z.string().min(1, {
    message: "Please enter your vehicle fuel consumption.",
  }),
  vehicleFuelUnit: z.string().min(1, {
    message: "Please select a unit.",
  }),
  businessTravel: z.string().min(1, {
    message: "Please enter your business travel distance.",
  }),
  businessTravelUnit: z.string().min(1, {
    message: "Please select a unit.",
  }),
});

export default function CarbonEvaluation() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("scope1");
  
  // Form definition
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      electricityConsumption: "",
      electricityUnit: "kWh",
      heatingConsumption: "",
      heatingUnit: "kWh",
      vehicleFuel: "",
      vehicleFuelUnit: "liters",
      businessTravel: "",
      businessTravelUnit: "km",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
    // Here we would calculate carbon footprint and display results
  }
  
  const tabs = [
    { 
      id: "scope1", 
      label: "Scope 1 (Direct)", 
      icon: <Factory className="h-4 w-4 mr-2" />,
      description: "Direct emissions from owned or controlled sources"
    },
    { 
      id: "scope2", 
      label: "Scope 2 (Indirect)", 
      icon: <Lightbulb className="h-4 w-4 mr-2" />,
      description: "Indirect emissions from purchased electricity, steam, heating and cooling"
    },
    { 
      id: "scope3", 
      label: "Scope 3 (Value Chain)", 
      icon: <Truck className="h-4 w-4 mr-2" />,
      description: "All other indirect emissions in a company's value chain"
    },
    { 
      id: "results", 
      label: "Results", 
      icon: <Activity className="h-4 w-4 mr-2" />,
      description: "Carbon footprint calculation results"
    }
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
          <div className="mb-6">
            <Progress value={
              activeTab === "scope1" ? 25 : 
              activeTab === "scope2" ? 50 : 
              activeTab === "scope3" ? 75 : 100
            } className="h-2" />
          </div>
          
          <TabsList className="grid grid-cols-2 lg:grid-cols-4 mb-6">
            {tabs.map(tab => (
              <TabsTrigger key={tab.id} value={tab.id} className="flex items-center">
                {tab.icon} {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
          
          <TabsContent value="scope1" className="space-y-4">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="heatingConsumption"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Heating Consumption</FormLabel>
                        <FormDescription>
                          Natural gas, fuel oil, or other heating fuel used
                        </FormDescription>
                        <div className="flex gap-2">
                          <FormControl>
                            <Input type="number" placeholder="Amount" {...field} />
                          </FormControl>
                          <FormField
                            control={form.control}
                            name="heatingUnit"
                            render={({ field }) => (
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger className="w-[120px]">
                                    <SelectValue placeholder="Unit" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="kWh">kWh</SelectItem>
                                  <SelectItem value="m3">m³</SelectItem>
                                  <SelectItem value="liters">Liters</SelectItem>
                                </SelectContent>
                              </Select>
                            )}
                          />
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="vehicleFuel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company Vehicle Fuel</FormLabel>
                        <FormDescription>
                          Fuel used by company-owned vehicles
                        </FormDescription>
                        <div className="flex gap-2">
                          <FormControl>
                            <Input type="number" placeholder="Amount" {...field} />
                          </FormControl>
                          <FormField
                            control={form.control}
                            name="vehicleFuelUnit"
                            render={({ field }) => (
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger className="w-[120px]">
                                    <SelectValue placeholder="Unit" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="liters">Liters</SelectItem>
                                  <SelectItem value="gallons">Gallons</SelectItem>
                                </SelectContent>
                              </Select>
                            )}
                          />
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="flex justify-end">
                  <Button type="button" onClick={() => setActiveTab("scope2")}>
                    Next: Scope 2 Emissions
                  </Button>
                </div>
              </form>
            </Form>
          </TabsContent>
          
          <TabsContent value="scope2" className="space-y-4">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="electricityConsumption"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Electricity Consumption</FormLabel>
                      <FormDescription>
                        Total electricity used in your facilities
                      </FormDescription>
                      <div className="flex gap-2">
                        <FormControl>
                          <Input type="number" placeholder="Amount" {...field} />
                        </FormControl>
                        <FormField
                          control={form.control}
                          name="electricityUnit"
                          render={({ field }) => (
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger className="w-[120px]">
                                  <SelectValue placeholder="Unit" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="kWh">kWh</SelectItem>
                                <SelectItem value="MWh">MWh</SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                        />
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex justify-between">
                  <Button type="button" variant="outline" onClick={() => setActiveTab("scope1")}>
                    Previous
                  </Button>
                  <Button type="button" onClick={() => setActiveTab("scope3")}>
                    Next: Scope 3 Emissions
                  </Button>
                </div>
              </form>
            </Form>
          </TabsContent>
          
          <TabsContent value="scope3" className="space-y-4">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="businessTravel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Business Travel</FormLabel>
                      <FormDescription>
                        Distance traveled for business purposes (flights, trains, etc.)
                      </FormDescription>
                      <div className="flex gap-2">
                        <FormControl>
                          <Input type="number" placeholder="Amount" {...field} />
                        </FormControl>
                        <FormField
                          control={form.control}
                          name="businessTravelUnit"
                          render={({ field }) => (
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger className="w-[120px]">
                                  <SelectValue placeholder="Unit" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="km">km</SelectItem>
                                <SelectItem value="miles">miles</SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                        />
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex justify-between">
                  <Button type="button" variant="outline" onClick={() => setActiveTab("scope2")}>
                    Previous
                  </Button>
                  <Button type="submit" onClick={() => setActiveTab("results")}>
                    Calculate Footprint
                  </Button>
                </div>
              </form>
            </Form>
          </TabsContent>
          
          <TabsContent value="results" className="space-y-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center p-8">
                  <Building2 className="h-12 w-12 mx-auto text-primary mb-4" />
                  <h3 className="text-2xl font-bold mb-2">Your Carbon Footprint</h3>
                  <p className="text-muted-foreground mb-4">Complete all sections to see your results</p>
                  
                  <div className="flex justify-center mb-8">
                    <div className="text-center p-4 border rounded-lg bg-muted/20">
                      <div className="text-4xl font-bold text-primary">--</div>
                      <div className="text-sm text-muted-foreground">tonnes CO2e/year</div>
                    </div>
                  </div>
                  
                  <Button 
                    variant="outline" 
                    onClick={() => setActiveTab("scope1")}
                    className="mx-auto"
                  >
                    Edit Inputs
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </AssessmentBase>
    </UserLayout>
  );
}
