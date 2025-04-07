
import { useState } from "react";
import { z } from "zod";
import { authService } from "@/services/auth/authService";

// Create a schema for registration form validation
export const registrationFormSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  phone: z.string().optional(),
  company: z.string().optional(),
  country: z.string().optional(),
  department: z.string().optional(),
  persona: z.string().optional(),
  marketingConsent: z.boolean().default(false),
});

// Extract the type from the schema
export type RegistrationFormValues = z.infer<typeof registrationFormSchema>;

export function useRegistration() {
  const [isLoading, setIsLoading] = useState(false);

  const registerUser = async (data: RegistrationFormValues) => {
    setIsLoading(true);
    try {
      console.log("Registering user:", data.email);
      
      const { error } = await authService.signUp(data.email, data.password, {
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        company: data.company,
        country: data.country,
        department: data.department,
        persona: data.persona,
        marketingConsent: data.marketingConsent
      });

      if (error) {
        console.error("Registration error:", error);
        throw error;
      }

      return true;
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    registerUser,
    isLoading,
  };
}
