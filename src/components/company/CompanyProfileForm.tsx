
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { Company } from "@/services/companyService";
import { Loader2 } from "lucide-react";
import { companyFormSchema, CompanyFormValues } from "./companyFormSchema";
import { CompanyLogoUpload } from "./CompanyLogoUpload";
import { CompanyFormFields } from "./CompanyFormFields";
import { FormErrorMessage } from "./form/FormErrorMessage";
import { useCompanyFormSubmit } from "./form/useCompanyFormSubmit";

interface CompanyProfileFormProps {
  company?: Company;
  onSuccess?: (company: Company) => void;
}

export function CompanyProfileForm({ company, onSuccess }: CompanyProfileFormProps) {
  const { 
    handleSubmit: submitHandler, 
    isSubmitting, 
    errorMessage,
    resetError
  } = useCompanyFormSubmit({ company, onSuccess });

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
        <FormErrorMessage message={errorMessage} />
        
        <Form {...form}>
          <form 
            onSubmit={form.handleSubmit(submitHandler)} 
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
