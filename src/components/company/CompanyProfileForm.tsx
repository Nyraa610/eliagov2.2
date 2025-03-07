import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { Company, companyService } from "@/services/companyService";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { Loader2, AlertCircle } from "lucide-react";
import { companyFormSchema, CompanyFormValues } from "./companyFormSchema";
import { CompanyLogoUpload } from "./CompanyLogoUpload";
import { CompanyFormFields } from "./CompanyFormFields";

interface CompanyProfileFormProps {
  company?: Company;
  onSuccess?: (company: Company) => void;
}

export function CompanyProfileForm({ company, onSuccess }: CompanyProfileFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
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
  
  const resetError = () => {
    if (errorMessage) {
      setErrorMessage(null);
    }
  };
  
  const onSubmit = async (values: CompanyFormValues) => {
    try {
      setIsSubmitting(true);
      setErrorMessage(null);
      let result: Company;
      
      console.log("Form submission started with values:", values);
      
      // Create a minimal company object with only the name and other fields if present
      const companyData: Partial<Company> = {
        name: values.name.trim(),
      };
      
      // Only add other fields if they have values
      if (values.industry) companyData.industry = values.industry;
      if (values.country) companyData.country = values.country;
      if (values.website) companyData.website = values.website;
      if (values.registry_number) companyData.registry_number = values.registry_number;
      if (values.registry_city) companyData.registry_city = values.registry_city;
      
      console.log("Simplified company data for submission:", companyData);
      
      if (company) {
        // Update existing company
        result = await companyService.updateCompany(company.id, companyData);
        toast({
          title: "Company updated",
          description: "Company profile has been updated successfully.",
        });
      } else {
        // Create new company with minimal data
        result = await companyService.createCompany(companyData);
        toast({
          title: "Company created",
          description: "New company has been created successfully.",
        });
      }
      
      console.log("Form submission completed successfully:", result);
      
      if (onSuccess) {
        onSuccess(result);
      } else {
        navigate(`/company/${result.id}`);
      }
    } catch (error) {
      console.error("Error saving company:", error);
      
      let errorDesc = "There was an error saving the company profile.";
      
      // Handle specific database errors
      if (error instanceof Error) {
        if (error.message.includes("infinite recursion") || 
            error.message.includes("policy for relation") ||
            error.message.includes("violates row-level security")) {
          errorDesc = "Database policy error. This might be due to an issue with user permissions. Please try again or contact support.";
        } else {
          errorDesc = error.message;
        }
      }
      
      setErrorMessage(errorDesc);
      
      toast({
        variant: "destructive",
        title: "Error",
        description: errorDesc
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
        {errorMessage && (
          <div className="bg-destructive/15 text-destructive rounded-md p-3 mb-4">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium">{errorMessage}</p>
                <p className="text-xs mt-1">If this issue persists, please refresh the page or contact support.</p>
              </div>
            </div>
          </div>
        )}
        
        <Form {...form}>
          <form 
            onSubmit={form.handleSubmit(onSubmit)} 
            onChange={resetError}
            className="space-y-6"
          >
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
