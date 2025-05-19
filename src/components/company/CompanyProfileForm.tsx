
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
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
import { FrenchRegistrySearch } from "./form/FrenchRegistrySearch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface CompanyProfileFormProps {
  company?: Company;
  onSuccess?: (company: Company) => void;
  onError?: (error: Error) => void;
  isNewCompany?: boolean;
}

export function CompanyProfileForm({ company, onSuccess, onError, isNewCompany = false }: CompanyProfileFormProps) {
  const [showFrenchSearch, setShowFrenchSearch] = useState(false);
  const [registryData, setRegistryData] = useState<any | null>(null);
  const { toast } = useToast();
  
  const { 
    handleSubmit: submitHandler, 
    isSubmitting, 
    errorMessage,
    resetError
  } = useCompanyFormSubmit({ company, onSuccess, onError });

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

  // When country changes to France, show the search
  const watchedCountry = form.watch("country");
  
  const handleCountryChange = (country: string) => {
    if (country.toLowerCase() === "france") {
      setShowFrenchSearch(true);
    } else {
      setShowFrenchSearch(false);
      setRegistryData(null);
    }
  };

  // Handle registry company selection
  const handleSelectCompany = (registryCompany: any) => {
    setRegistryData(registryCompany);
    
    // Update form values with registry data
    form.setValue("name", registryCompany.name || "");
    form.setValue("registry_number", registryCompany.siren || "");
    form.setValue("registry_city", "France");
    
    // Try to extract industry from activity code
    if (registryCompany.activityCode) {
      // In a real application, you might have a mapping of activity codes to industries
      form.setValue("industry", `Activity Code: ${registryCompany.activityCode}`);
    }
    
    toast({
      title: "Company Selected",
      description: "Official company information has been loaded from the registry",
    });
  };

  // Extend submit handler to include registry data
  const handleFormSubmit = (values: CompanyFormValues) => {
    // If we have registry data, include it in the submission
    if (registryData) {
      const enhancedValues = {
        ...values,
        // Add registry-specific fields
        siren: registryData.siren,
        siret: registryData.siret,
        legal_form: registryData.legalForm,
        activity_code: registryData.activityCode,
        registry_status: registryData.status,
        official_address: registryData.address,
        employee_count_range: registryData.employeeCount,
        creation_date: registryData.creationDate,
      };
      
      submitHandler(enhancedValues as any);
    } else {
      submitHandler(values);
    }
  };

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>{isNewCompany ? "Create New Company" : company ? "Edit Company Profile" : "Create Company"}</CardTitle>
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
            onSubmit={form.handleSubmit(handleFormSubmit)} 
            onChange={() => {
              resetError();
              handleCountryChange(form.getValues("country"));
            }}
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
            
            {showFrenchSearch && (
              <div className="space-y-4 mt-6">
                <Separator />
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-medium">French Company Registry Search</h3>
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-200">
                    Official Data
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Search for your company in the official French registry to automatically fill in verified information.
                </p>
                <FrenchRegistrySearch onSelectCompany={handleSelectCompany} />
                
                {registryData && (
                  <div className="bg-green-50 dark:bg-green-900 p-3 rounded-md mt-2">
                    <p className="text-sm text-green-700 dark:text-green-200">
                      ✓ Official company information loaded
                    </p>
                  </div>
                )}
              </div>
            )}
            
            <CardFooter className="px-0 pb-0 pt-4">
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="flex items-center gap-2"
              >
                {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                {isNewCompany ? "Create Company" : company ? "Save Changes" : "Create Company"}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
