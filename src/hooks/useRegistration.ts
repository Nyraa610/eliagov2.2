
import { useState } from "react";
import { z } from "zod";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";

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
  termsConsent: z.boolean().default(false),
});

// Extract the type from the schema
export type RegistrationFormValues = z.infer<typeof registrationFormSchema>;

export function useRegistration() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const registerUser = async (data: RegistrationFormValues) => {
    setIsLoading(true);
    try {
      console.log("Registering user:", data.email);
      
      // Format user metadata for Supabase
      const metadata = {
        first_name: data.firstName,
        last_name: data.lastName,
        phone: data.phone || "",
        company: data.company || "",
        country: data.country || "",
        department: data.department || "",
        persona: data.persona || "",
        marketing_consent: data.marketingConsent
      };

      console.log("User metadata:", metadata);

      // Sign up the user with Supabase
      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: metadata,
        }
      });

      if (error) {
        console.error("Registration error:", error);
        toast({
          variant: "destructive",
          title: "Registration failed",
          description: error.message || "Failed to register. Please try again.",
        });
        return false;
      }

      console.log("Registration successful:", authData);

      // Try to send welcome email
      try {
        await supabase.functions.invoke("send-supabase-email", {
          body: {
            to: data.email,
            subject: "Welcome to ELIA GO!",
            html: `
              <h1>Welcome to ELIA GO, ${data.firstName}!</h1>
              <p>Thank you for creating an account with us. We're excited to have you join our sustainability journey!</p>
              <p>To get started, please confirm your email address by clicking the verification link sent in a separate email.</p>
              <p>Best regards,<br>The ELIA GO Team</p>
            `
          }
        });
        console.log("Welcome email sent successfully");
      } catch (emailError) {
        console.error("Failed to send welcome email:", emailError);
        // Don't block registration if email sending fails
      }

      return true;
    } catch (error) {
      console.error("Registration error:", error);
      toast({
        variant: "destructive",
        title: "Registration failed",
        description: "An unexpected error occurred. Please try again.",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    registerUser,
    isLoading,
  };
}
