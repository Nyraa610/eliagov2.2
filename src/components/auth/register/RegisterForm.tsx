
import { useState, useEffect } from "react";
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

  // Load Cloudflare Turnstile script
  useEffect(() => {
    // Only load if it hasn't been loaded already
    if (typeof window !== 'undefined' && !window.document.getElementById('turnstile-script')) {
      const script = document.createElement('script');
      script.id = 'turnstile-script';
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }
  }, []);

  // Step 1 form (basic info)
  const basicInfoForm = useForm<Partial<RegistrationFormValues>>({
    resolver: zodResolver(registrationFormSchema.pick({
      email: true,
      password: true,
      firstName: true,
      lastName: true,
      phone: true,
      company: true,
      country: true,
    })),
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
  const additionalInfoForm = useForm<Partial<RegistrationFormValues>>({
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
        <>
          {/* Captcha container - will be populated by Turnstile */}
          <div id="captcha-container" className="flex justify-center my-4"></div>
          
          <AdditionalInfoForm 
            form={additionalInfoForm} 
            onSubmit={onAdditionalInfoSubmit} 
            onBack={goBack}
            isLoading={isLoading} 
          />
        </>
      )}
    </div>
  );
}
