
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { supabase } from "@/lib/supabase";
import { companyService } from "@/services/companyService";
import { useToast } from "@/hooks/use-toast";

// Registration form schema
export const registrationFormSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  phone: z.string().min(10, "Please enter a valid phone number"),
  company: z.string().min(2, "Company name must be at least 2 characters"),
  country: z.string().min(2, "Please select a valid country"),
});

export type RegistrationFormValues = z.infer<typeof registrationFormSchema>;

export const useRegistration = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  // Check if user is already logged in
  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        navigate("/dashboard");
      }
    };
    checkAuth();
  }, [navigate]);

  const registerUser = async (values: RegistrationFormValues) => {
    setIsLoading(true);
    console.log("Starting registration process...");
    
    try {
      // Step 1: Sign up the user with Supabase Auth
      console.log("Attempting to sign up with Supabase...");
      const { data, error } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          data: {
            first_name: values.firstName,
            last_name: values.lastName,
            phone: values.phone,
            company: values.company,
            country: values.country,
          },
        },
      });

      console.log("Supabase response received:", { data, error });

      if (error) {
        console.error("Supabase error:", error);
        throw error;
      }
      
      if (!data.user) {
        throw new Error("User registration failed");
      }
      
      // Step 2: Wait a moment to ensure the database trigger has time to create the profile
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Step 3: Create company - this will only work if the profile was successfully created
      console.log("User registered, now creating company:", values.company);
      try {
        const company = await companyService.createCompany({
          name: values.company,
          country: values.country
        });
        
        console.log("Company created successfully:", company);
      } catch (companyError) {
        console.error("Error creating company:", companyError);
        toast({
          variant: "destructive",
          title: "Company creation issue",
          description: "Your account was created, but there was an issue creating your company. Please log in and try again.",
          selectable: true,
        });
      }

      toast({
        title: "Registration successful!",
        description: "Please check your email to confirm your account.",
      });
      
      navigate("/register/confirmation");
    } catch (error: any) {
      console.error("Registration error:", error);
      
      let errorMessage = "Something went wrong. Please try again.";
      if (error.message) {
        errorMessage = error.message;
      } else if (error.error_description) {
        errorMessage = error.error_description;
      }

      toast({
        variant: "destructive",
        title: "Registration failed",
        description: errorMessage,
        selectable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    registerUser,
  };
};
