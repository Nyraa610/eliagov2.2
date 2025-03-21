
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { BasicInfoForm } from "./BasicInfoForm";
import { AdditionalInfoForm } from "./AdditionalInfoForm";
import { basicInfoSchema, additionalInfoSchema } from "./formSchemas";

export function RegisterForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [step, setStep] = useState(1); // Track form step
  const [basicInfo, setBasicInfo] = useState<z.infer<typeof basicInfoSchema> | null>(null);
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { signUp } = useAuth();
  
  // Handle first step submission
  const onSubmitBasicInfo = (values: z.infer<typeof basicInfoSchema>) => {
    setBasicInfo(values);
    setStep(2); // Proceed to the next step
  };

  // Handle second step and complete registration
  const onSubmitAdditionalInfo = async (values: z.infer<typeof additionalInfoSchema>) => {
    if (!basicInfo) return;
    
    setServerError(null);
    setIsLoading(true);
    
    try {
      // Combine data from both steps
      const fullData = {
        ...basicInfo,
        department: values.department,
        persona: values.persona,
        marketingConsent: values.marketingConsent,
        termsAccepted: values.termsConsent,
      };
      
      const { error } = await signUp(basicInfo.email, basicInfo.password, {
        firstName: basicInfo.firstName,
        lastName: basicInfo.lastName,
        phone: basicInfo.phone,
        company: basicInfo.company,
        country: basicInfo.country,
        department: values.department,
        persona: values.persona,
        marketingConsent: values.marketingConsent ? true : false,
      });
      
      if (error) {
        setServerError(error.message || "Registration failed. Please try again.");
        setStep(1); // Go back to first step if there's an error
        return;
      }
      
      // Show success message
      toast({
        title: "Registration successful!",
        description: "Your account has been created successfully. Please check your email to confirm your account.",
      });
      
      // Redirect to confirmation page
      navigate("/register/confirmation");
    } catch (error: any) {
      console.error("Registration error:", error);
      setServerError(error.message || "An unexpected error occurred. Please try again.");
      setStep(1); // Go back to first step if there's an error
    } finally {
      setIsLoading(false);
    }
  };

  // Go back to first step
  const handleBack = () => {
    setStep(1);
  };

  return (
    <div>
      {step === 1 ? (
        <BasicInfoForm onSubmit={onSubmitBasicInfo} serverError={serverError} />
      ) : (
        <AdditionalInfoForm 
          onSubmit={onSubmitAdditionalInfo} 
          onBack={handleBack} 
          isLoading={isLoading} 
        />
      )}
    </div>
  );
}
