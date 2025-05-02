
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useRegistration, registrationFormSchema, RegistrationFormValues } from "@/hooks/useRegistration";
import { BasicInfoForm } from "./BasicInfoForm";
import { AdditionalInfoForm } from "./AdditionalInfoForm";
import { z } from "zod";

// Create partial schemas for the multi-step form
const basicInfoSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Confirm password must be at least 6 characters"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  phone: z.string().optional(),
  company: z.string().optional(),
  country: z.string().optional(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"]
});

const additionalInfoSchema = z.object({
  department: z.string().optional(),
  persona: z.string().optional(),
  marketingConsent: z.boolean().default(false),
  termsConsent: z.boolean().default(false),
});

export function RegisterForm() {
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);
  const [basicData, setBasicData] = useState<Partial<RegistrationFormValues>>({});
  const { toast } = useToast();
  const navigate = useNavigate();
  const { registerUser, isLoading } = useRegistration();

  // Step 1 form (basic info)
  const basicInfoForm = useForm<Partial<RegistrationFormValues>>({
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
  const additionalInfoForm = useForm<Partial<RegistrationFormValues>>({
    resolver: zodResolver(additionalInfoSchema),
    defaultValues: {
      department: "",
      persona: "",
      marketingConsent: false,
      termsConsent: false,
    },
  });

  const onBasicInfoSubmit = (data: Partial<RegistrationFormValues>) => {
    console.log("Basic info submitted:", data);
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

      console.log("Submitting registration with data:", combinedData);
      
      const success = await registerUser(combinedData);
      
      if (success) {
        // Navigate to confirmation page
        toast({
          title: "Registration successful",
          description: "Please check your email to verify your account.",
        });
        
        navigate("/register/confirmation");
      }
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
