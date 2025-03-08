
import { useState } from "react";
import { CompanyFormValues } from "../companyFormSchema";
import { Company, companyService } from "@/services/companyService";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface UseCompanyFormSubmitProps {
  company?: Company;
  onSuccess?: (company: Company) => void;
}

export function useCompanyFormSubmit({ company, onSuccess }: UseCompanyFormSubmitProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const resetError = () => {
    if (errorMessage) {
      setErrorMessage(null);
    }
  };
  
  const handleSubmit = async (values: CompanyFormValues) => {
    try {
      setIsSubmitting(true);
      setErrorMessage(null);
      let result: Company;
      
      console.log("Form submission started with values:", values);
      
      // Create a minimal company object with only the name
      // This is crucial - we want to ensure minimal data is required for creation
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
        console.log(`Updating company ${company.id} with data:`, companyData);
        result = await companyService.updateCompany(company.id, companyData);
        console.log("Company updated successfully:", result);
        
        toast({
          title: "Company updated",
          description: "Company profile has been updated successfully.",
        });
      } else {
        // Create new company
        console.log("Creating new company with data:", companyData);
        result = await companyService.createCompany(companyData);
        console.log("Company created successfully:", result);
        
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
        if (error.message.includes("violates row-level security")) {
          errorDesc = "Permission denied. You don't have access to perform this action.";
        } else if (error.message.includes("foreignKey constraint")) {
          errorDesc = "Database constraint error. Some referenced data may be missing.";
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

  return {
    handleSubmit,
    isSubmitting,
    errorMessage,
    resetError
  };
}
