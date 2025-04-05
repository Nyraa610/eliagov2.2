
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useRegistration, registrationFormSchema, RegistrationFormValues } from "@/hooks/useRegistration";
import { BasicInfoForm } from "./BasicInfoForm";
import { AdditionalInfoForm } from "./AdditionalInfoForm";

export function RegisterForm() {
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);
  const [basicData, setBasicData] = useState<Partial<RegistrationFormValues>>({});
  const { toast } = useToast();
  const navigate = useNavigate();
  const { registerUser, isLoading } = useRegistration();

  // Step 1 form (basic info)
  const basicInfoForm = useForm<RegistrationFormValues>({
    resolver: zodResolver(registrationFormSchema),
    defaultValues: {
      email: "",
      password: "",
      firstName: "",
      lastName: "",
      phone: "",
      company: "",
      country: "",
    },
  });

  // Step 2 form (additional info)
  const additionalInfoForm = useForm<RegistrationFormValues>({
    resolver: zodResolver(registrationFormSchema.pick({
      department: true,
      persona: true,
      marketingConsent: true,
    })),
    defaultValues: {
      department: "",
      persona: "",
      marketingConsent: false,
    },
  });

  const onBasicInfoSubmit = (data: Partial<RegistrationFormValues>) => {
    setBasicData(data);
    setCurrentStep(2);
  };

  const onAdditionalInfoSubmit = async (data: Partial<RegistrationFormValues>) => {
    try {
      // Combine data from both forms
      const combinedData = {
        ...basicData,
        ...data,
      } as RegistrationFormValues;

      await registerUser(combinedData);
      
      // Navigate to confirmation page
      navigate("/register/confirmation");
    } catch (error: any) {
      console.error("Registration error:", error);
      toast({
        variant: "destructive",
        title: "Registration failed",
        description: error?.message || "Failed to register. Please try again.",
      });
    }
  };

  const goBack = () => {
    setCurrentStep(1);
  };

  return (
    <div className="space-y-4">
      {currentStep === 1 ? (
        <BasicInfoForm 
          form={basicInfoForm} 
          onSubmit={onBasicInfoSubmit}
          isLoading={isLoading} 
        />
      ) : (
        <AdditionalInfoForm 
          form={additionalInfoForm} 
          onSubmit={onAdditionalInfoSubmit} 
          onBack={goBack}
          isLoading={isLoading} 
        />
      )}
    </div>
  );
}
