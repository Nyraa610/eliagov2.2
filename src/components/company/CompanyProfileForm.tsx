
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { Company, companyService } from "@/services/companyService";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { companyFormSchema, CompanyFormValues } from "./companyFormSchema";
import { CompanyLogoUpload } from "./CompanyLogoUpload";
import { CompanyFormFields } from "./CompanyFormFields";

interface CompanyProfileFormProps {
  company?: Company;
  onSuccess?: (company: Company) => void;
}

export function CompanyProfileForm({ company, onSuccess }: CompanyProfileFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const form = useForm<CompanyFormValues>({
    resolver: zodResolver(companyFormSchema),
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
      setIsSubmitting(true);
      let result: Company;
      
      console.log("Form submission started:", values);
      
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
      
      console.log("Form submission completed:", result);
      
      if (onSuccess) {
        onSuccess(result);
      } else {
        navigate(`/company/${result.id}`);
      }
    } catch (error) {
      console.error("Error saving company:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "There was an error saving the company profile.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
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
              <CompanyLogoUpload 
                company={company} 
                isDisabled={isSubmitting} 
              />
            )}

            <CompanyFormFields 
              form={form} 
              isSubmitting={isSubmitting} 
            />
            
            <CardFooter className="px-0 pb-0 pt-4">
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="flex items-center gap-2"
              >
                {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                {company ? "Save Changes" : "Create Company"}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
