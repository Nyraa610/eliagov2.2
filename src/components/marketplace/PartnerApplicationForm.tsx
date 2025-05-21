
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/components/ui/use-toast";
import { ApplicationSubmitData, marketplaceService } from "@/services/marketplace";
import { MultiSelect } from "@/components/ui/multi-select";
import { Loader2 } from "lucide-react";

const partnerApplicationSchema = z.object({
  company_name: z.string().min(1, "Company name is required"),
  contact_name: z.string().min(1, "Contact name is required"),
  contact_email: z.string().email("Invalid email address"),
  contact_phone: z.string().optional(),
  company_website: z.string().url("Invalid URL").optional().or(z.literal("")),
  company_description: z.string().optional(),
  services_offered: z.string().optional(),
  locations: z.array(z.string()).default([]),
  company_sizes: z.array(z.string()).default([]),
  budget_ranges: z.array(z.string()).default([]),
  categories: z.array(z.string()).default([]),
});

const locationOptions = [
  { label: "North America", value: "North America" },
  { label: "Europe", value: "Europe" },
  { label: "Asia", value: "Asia" },
  { label: "South America", value: "South America" },
  { label: "Africa", value: "Africa" },
  { label: "Australia/Oceania", value: "Australia/Oceania" },
];

const companySizeOptions = [
  { label: "Startup (<10 employees)", value: "Startup" },
  { label: "Small (10-50 employees)", value: "Small" },
  { label: "Medium (51-250 employees)", value: "Medium" },
  { label: "Large (251-1000 employees)", value: "Large" },
  { label: "Enterprise (1000+ employees)", value: "Enterprise" },
];

const budgetRangeOptions = [
  { label: "Under $5,000", value: "Under $5,000" },
  { label: "5,000 - $20,000", value: "$5,000 - $20,000" },
  { label: "$20,000 - $50,000", value: "$20,000 - $50,000" },
  { label: "$50,000 - $100,000", value: "$50,000 - $100,000" },
  { label: "$100,000+", value: "$100,000+" },
];

const categoryOptions = [
  { label: "Carbon Management", value: "Carbon Management" },
  { label: "Sustainability Reporting", value: "Sustainability Reporting" },
  { label: "Green Energy", value: "Green Energy" },
  { label: "Waste Management", value: "Waste Management" },
  { label: "ESG Consulting", value: "ESG Consulting" },
  { label: "Sustainable Supply Chain", value: "Sustainable Supply Chain" },
  { label: "Circular Economy", value: "Circular Economy" },
];

export function PartnerApplicationForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  
  const form = useForm<z.infer<typeof partnerApplicationSchema>>({
    resolver: zodResolver(partnerApplicationSchema),
    defaultValues: {
      company_name: "",
      contact_name: "",
      contact_email: "",
      contact_phone: "",
      company_website: "",
      company_description: "",
      services_offered: "",
      locations: [],
      company_sizes: [],
      budget_ranges: [],
      categories: [],
    },
  });

  const onSubmit = async (data: z.infer<typeof partnerApplicationSchema>) => {
    setIsSubmitting(true);
    
    try {
      await marketplaceService.submitPartnerApplication(data as ApplicationSubmitData);
      
      toast({
        title: "Application submitted successfully",
        description: "Thank you for applying. We'll review your application and get back to you soon.",
      });
      
      form.reset();
    } catch (error) {
      console.error("Error submitting partner application:", error);
      toast({
        title: "Error",
        description: "Failed to submit your application. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Apply to become an ESG Solution Provider</CardTitle>
        <CardDescription>
          Join our marketplace to connect with companies looking for sustainability solutions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-6">
                <FormField
                  control={form.control}
                  name="company_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company Name *</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="contact_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Person *</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="contact_email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address *</FormLabel>
                      <FormControl>
                        <Input {...field} type="email" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="contact_phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input {...field} type="tel" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="company_website"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company Website</FormLabel>
                      <FormControl>
                        <Input {...field} type="url" placeholder="https://" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="space-y-6">
                <FormField
                  control={form.control}
                  name="company_description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          rows={3} 
                          placeholder="Describe your company and what you offer..."
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="services_offered"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Services Offered</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          rows={3} 
                          placeholder="List the services you provide..."
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="locations"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Regions Served</FormLabel>
                    <FormControl>
                      <MultiSelect
                        options={locationOptions}
                        selected={field.value}
                        onChange={field.onChange}
                        placeholder="Select regions..."
                      />
                    </FormControl>
                    <FormDescription>
                      Select all regions where you provide services
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="categories"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Service Categories</FormLabel>
                    <FormControl>
                      <MultiSelect
                        options={categoryOptions}
                        selected={field.value}
                        onChange={field.onChange}
                        placeholder="Select categories..."
                      />
                    </FormControl>
                    <FormDescription>
                      Select all categories that apply to your services
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="company_sizes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Client Company Sizes</FormLabel>
                    <FormControl>
                      <MultiSelect
                        options={companySizeOptions}
                        selected={field.value}
                        onChange={field.onChange}
                        placeholder="Select company sizes..."
                      />
                    </FormControl>
                    <FormDescription>
                      Select the company sizes you typically serve
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="budget_ranges"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Budget Ranges</FormLabel>
                    <FormControl>
                      <MultiSelect
                        options={budgetRangeOptions}
                        selected={field.value}
                        onChange={field.onChange}
                        placeholder="Select budget ranges..."
                      />
                    </FormControl>
                    <FormDescription>
                      Select the budget ranges for your services
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="pt-4 flex justify-center md:justify-end">
              <Button type="submit" disabled={isSubmitting} className="w-full md:w-auto">
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Application"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
