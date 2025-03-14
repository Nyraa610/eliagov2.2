
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
  
  const handleSubmit = async (values: CompanyFormValues & Record<string, any>) => {
    try {
      setIsSubmitting(true);
      setErrorMessage(null);
      let result: Company;
      
      console.log("Form submission started with values:", values);
      
      // Create a data object for the company
      const companyData: Record<string, any> = {
        name: values.name.trim(),
      };
      
      // Only add other fields if they have values
      if (values.industry) companyData.industry = values.industry;
      if (values.country) companyData.country = values.country;
      if (values.website) companyData.website = values.website;
      if (values.registry_number) companyData.registry_number = values.registry_number;
      if (values.registry_city) companyData.registry_city = values.registry_city;
      
      // Add French registry data if available
      if (values.siren) companyData.siren = values.siren;
      if (values.siret) companyData.siret = values.siret;
      if (values.legal_form) companyData.legal_form = values.legal_form;
      if (values.activity_code) companyData.activity_code = values.activity_code;
      if (values.registry_status) companyData.registry_status = values.registry_status;
      if (values.official_address) companyData.official_address = values.official_address;
      if (values.employee_count_range) companyData.employee_count_range = values.employee_count_range;
      if (values.creation_date) companyData.creation_date = values.creation_date;
      
      console.log("Prepared company data for submission:", companyData);
      
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
