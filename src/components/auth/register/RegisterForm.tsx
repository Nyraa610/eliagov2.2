
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useRegistration } from "@/hooks/useRegistration";
import { RegisterFormData, basicInfoSchema, additionalInfoSchema } from "./formSchemas";
import { BasicInfoForm } from "./BasicInfoForm";
import { AdditionalInfoForm } from "./AdditionalInfoForm";

export function RegisterForm() {
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);
  const [basicData, setBasicData] = useState<Partial<RegisterFormData>>({});
  const { toast } = useToast();
  const navigate = useNavigate();
  const { registerUser, isLoading } = useRegistration();

  // Step 1 form (basic info)
  const basicInfoForm = useForm<RegisterFormData>({
    resolver: zodResolver(basicInfoSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      firstName: "",
      lastName: "",
      phone: "",
      company: "",
      country: "",
    },
  });

  // Step 2 form (additional info)
  const additionalInfoForm = useForm<RegisterFormData>({
    resolver: zodResolver(additionalInfoSchema),
    defaultValues: {
      department: "",
      persona: "",
      marketingConsent: false,
      termsConsent: false,
    },
  });

  const onBasicInfoSubmit = (data: Partial<RegisterFormData>) => {
    setBasicData(data);
    setCurrentStep(2);
  };

  const onAdditionalInfoSubmit = async (data: Partial<RegisterFormData>) => {
    try {
      // Combine data from both forms
      const combinedData: RegisterFormData = {
        ...basicData,
        ...data,
      } as RegisterFormData;

      await registerUser(combinedData);
      
      // Show success message and navigate
      toast({
        description: "Registration successful! Please check your email to confirm your account.",
      });
      navigate("/register-confirmation");
    } catch (error: any) {
      console.error("Registration error:", error);
      toast({
        variant: "destructive",
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
