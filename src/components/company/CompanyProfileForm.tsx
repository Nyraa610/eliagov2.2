
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Company, companyService } from "@/services/companyService";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Company name must be at least 2 characters.",
  }),
  industry: z.string().optional(),
  country: z.string().optional(),
  website: z.string().url({ message: "Please enter a valid URL" }).optional().or(z.literal('')),
  registry_number: z.string().optional(),
  registry_city: z.string().optional(),
});

type CompanyFormValues = z.infer<typeof formSchema>;

interface CompanyProfileFormProps {
  company?: Company;
  onSuccess?: (company: Company) => void;
}

export function CompanyProfileForm({ company, onSuccess }: CompanyProfileFormProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(company?.logo_url || null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const form = useForm<CompanyFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: company?.name || "",
      industry: company?.industry || "",
      country: company?.country || "",
      website: company?.website || "",
      registry_number: company?.registry_number || "",
      registry_city: company?.registry_city || "",
    },
  });
  
  const onSubmit = async (values: CompanyFormValues) => {
    try {
      let result: Company;
      
      if (company) {
        // Update existing company
        result = await companyService.updateCompany(company.id, values);
        toast({
          title: "Company updated",
          description: "Company profile has been updated successfully.",
        });
      } else {
        // Create new company
        result = await companyService.createCompany(values);
        toast({
          title: "Company created",
          description: "New company has been created successfully.",
        });
      }
      
      if (onSuccess) {
        onSuccess(result);
      } else {
        navigate(`/company/${result.id}`);
      }
    } catch (error) {
      console.error("Error saving company:", error);
      toast({
        title: "Error",
        description: "There was an error saving the company profile.",
        variant: "destructive",
      });
    }
  };
  
  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !company) return;
    
    try {
      setIsUploading(true);
      
      // Create object URL for preview
      const previewUrl = URL.createObjectURL(file);
      setLogoPreview(previewUrl);
      
      // Upload to storage
      const logoUrl = await companyService.uploadLogo(company.id, file);
      
      toast({
        title: "Logo uploaded",
        description: "Company logo has been updated successfully.",
      });
    } catch (error) {
      console.error("Error uploading logo:", error);
      toast({
        title: "Error",
        description: "There was an error uploading the company logo.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>{company ? "Edit Company Profile" : "Create New Company"}</CardTitle>
        <CardDescription>
          {company 
            ? "Update your company details and information" 
            : "Set up a new company profile in the system"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {company && (
              <div className="flex flex-col items-center space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
                <Avatar className="w-24 h-24">
                  <AvatarImage src={logoPreview || company.logo_url || undefined} />
                  <AvatarFallback className="text-xl">{company.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col space-y-2">
                  <Label htmlFor="logo">Company Logo</Label>
                  <Input
                    id="logo"
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    disabled={isUploading}
                  />
                  <p className="text-sm text-muted-foreground">Recommended size: 256x256px</p>
                </div>
              </div>
            )}

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company Name*</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter company name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="industry"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Industry</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Technology, Manufacturing" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Country</FormLabel>
                    <FormControl>
                      <Input placeholder="Country" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="website"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Website</FormLabel>
                  <FormControl>
                    <Input placeholder="https://www.example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="registry_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Registry Number</FormLabel>
                    <FormControl>
                      <Input placeholder="Company registration number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="registry_city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Registry City</FormLabel>
                    <FormControl>
                      <Input placeholder="City of registration" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <CardFooter className="px-0 pb-0 pt-4">
              <Button type="submit" disabled={form.formState.isSubmitting || isUploading}>
                {company ? "Save Changes" : "Create Company"}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
