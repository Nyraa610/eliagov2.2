
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { supabase } from "@/lib/supabase";
import { companyService } from "@/services/companyService";
import { companyMemberService } from "@/services/companyMemberService";
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

      console.log("Supabase response received:", { 
        user: data.user?.id ? `User ID: ${data.user.id}` : "No user created", 
        error: error ? error.message : "No error"
      });

      if (error) {
        console.error("Supabase error:", error);
        throw error;
      }
      
      if (!data.user) {
        throw new Error("User registration failed");
      }

      // Step 2: Create the company separately using the basic service
      // This avoids relying on the profile for company creation
      try {
        console.log("Creating company directly via base service:", values.company);
        
        // Create minimal company data
        const companyData = {
          name: values.company,
          country: values.country
        };
        
        // Use the base service directly to create the company without user association
        const { data: createCompanyResponse, error: companyError } = await supabase
          .from('companies')
          .insert([companyData])
          .select()
          .single();
          
        if (companyError) {
          console.error("Error creating company directly:", companyError);
          throw companyError;
        }
        
        if (!createCompanyResponse) {
          throw new Error("Failed to create company: No data returned");
        }
        
        const company = createCompanyResponse;
        console.log("Company created successfully:", company);
        
        // Step 3: Add the user as a company admin
        try {
          console.log("Adding user as company member:", {
            companyId: company.id,
            userId: data.user.id,
            isAdmin: true
          });
          
          const { error: memberError } = await supabase
            .from('company_members')
            .insert([{
              company_id: company.id,
              user_id: data.user.id,
              is_admin: true
            }]);
            
          if (memberError) {
            console.error("Error adding user as company member:", memberError);
            // Continue anyway since company was created
          } else {
            console.log("User added as company admin successfully");
          }
        } catch (memberError: any) {
          console.error("Exception adding user as company member:", memberError);
          // Continue anyway since company was created
        }
        
        toast({
          title: "Registration successful!",
          description: "Please check your email to confirm your account.",
        });
        
        navigate("/register/confirmation");
      } catch (companyError: any) {
        console.error("Error in company creation process:", companyError);
        
        toast({
          variant: "destructive",
          title: "Registration issue",
          description: "Your account was created, but there was an issue with company setup. Please try logging in.",
        });
        
        // Try to sign the user out, so they can log in again properly
        await supabase.auth.signOut();
        navigate("/login");
      }
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
