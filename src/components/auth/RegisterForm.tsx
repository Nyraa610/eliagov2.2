
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

// First step form schema definition
const basicInfoSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  confirmPassword: z.string(),
  firstName: z.string().min(2, "First name must be at least 2 characters").optional(),
  lastName: z.string().min(2, "Last name must be at least 2 characters").optional(),
  phone: z.string().min(10, "Please enter a valid phone number").optional(),
  company: z.string().min(2, "Company name must be at least 2 characters").optional(),
  country: z.string().min(2, "Please select a valid country").optional(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// Second step form schema for additional information
const additionalInfoSchema = z.object({
  department: z.string().min(1, "Please select a department"),
  persona: z.string().min(1, "Please select your role"),
  marketingConsent: z.boolean().optional(),
  termsConsent: z.boolean().refine(val => val === true, {
    message: "You must accept the terms and conditions to continue",
  }),
});

// Combined schema type for all form data
type RegisterFormData = z.infer<typeof basicInfoSchema> & z.infer<typeof additionalInfoSchema>;

export function RegisterForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [step, setStep] = useState(1); // Track form step
  const [basicInfo, setBasicInfo] = useState<z.infer<typeof basicInfoSchema> | null>(null);
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { signUp } = useAuth();
  
  // First step form
  const basicForm = useForm<z.infer<typeof basicInfoSchema>>({
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

  // Second step form
  const additionalForm = useForm<z.infer<typeof additionalInfoSchema>>({
    resolver: zodResolver(additionalInfoSchema),
    defaultValues: {
      department: "",
      persona: "",
      marketingConsent: false,
      termsConsent: false,
    },
  });

  // Department options
  const departments = [
    { value: "legal", label: "Legal" },
    { value: "operations", label: "Operations" },
    { value: "csr", label: "CSR/Sustainability" },
    { value: "product", label: "Product" },
    { value: "finance", label: "Finance" },
    { value: "hr", label: "Human Resources" },
    { value: "marketing", label: "Marketing" },
    { value: "executive", label: "Executive Leadership" },
  ];

  // Role personas based on department
  const getPersonaOptions = (department: string) => {
    switch (department) {
      case "legal":
        return [
          { value: "general_counsel", label: "General Counsel" },
          { value: "legal_specialist", label: "Legal Specialist" },
          { value: "compliance_officer", label: "Compliance Officer" },
        ];
      case "operations":
        return [
          { value: "operations_director", label: "Operations Director" },
          { value: "supply_chain_manager", label: "Supply Chain Manager" },
          { value: "logistics_manager", label: "Logistics Manager" },
        ];
      case "csr":
        return [
          { value: "csr_director", label: "CSR/ESG Director" },
          { value: "sustainability_manager", label: "Sustainability Manager" },
          { value: "esg_specialist", label: "ESG Specialist" },
        ];
      case "product":
        return [
          { value: "product_manager", label: "Product Manager" },
          { value: "r_and_d_director", label: "R&D Director" },
          { value: "innovation_manager", label: "Innovation Manager" },
        ];
      case "finance":
        return [
          { value: "cfo", label: "CFO" },
          { value: "finance_director", label: "Finance Director" },
          { value: "controller", label: "Controller" },
        ];
      case "hr":
        return [
          { value: "hr_director", label: "HR Director" },
          { value: "talent_acquisition", label: "Talent Acquisition Manager" },
          { value: "learning_development", label: "Learning & Development Manager" },
        ];
      case "marketing":
        return [
          { value: "marketing_director", label: "Marketing Director" },
          { value: "brand_manager", label: "Brand Manager" },
          { value: "communications_manager", label: "Communications Manager" },
        ];
      case "executive":
        return [
          { value: "ceo", label: "CEO" },
          { value: "coo", label: "COO" },
          { value: "owner", label: "Owner" },
        ];
      default:
        return [
          { value: "manager", label: "Manager" },
          { value: "specialist", label: "Specialist" },
          { value: "other", label: "Other" },
        ];
    }
  };
  
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
        <Form {...basicForm}>
          <form onSubmit={basicForm.handleSubmit(onSubmitBasicInfo)} className="space-y-4">
            <FormField
              control={basicForm.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="email@company.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={basicForm.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={basicForm.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={basicForm.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={basicForm.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={basicForm.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input placeholder="+1234567890" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={basicForm.control}
              name="company"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Company Ltd." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={basicForm.control}
              name="country"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Country</FormLabel>
                  <FormControl>
                    <Input placeholder="France" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {serverError && (
              <div className="p-3 bg-red-50 text-red-600 rounded-md text-sm">
                {serverError}
              </div>
            )}

            <Button type="submit" className="w-full">
              Continue
            </Button>
          </form>
        </Form>
      ) : (
        <Form {...additionalForm}>
          <form onSubmit={additionalForm.handleSubmit(onSubmitAdditionalInfo)} className="space-y-4">
            <div className="text-sm text-gray-500 mb-4">
              <p>Tell us a bit more about yourself to help us personalize your experience</p>
            </div>
            
            <FormField
              control={additionalForm.control}
              name="department"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Department</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your department" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {departments.map((dept) => (
                        <SelectItem key={dept.value} value={dept.value}>
                          {dept.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={additionalForm.control}
              name="persona"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your Role</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                    disabled={!additionalForm.watch("department")}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={additionalForm.watch("department") ? "Select your role" : "Please select a department first"} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {getPersonaOptions(additionalForm.watch("department")).map((role) => (
                        <SelectItem key={role.value} value={role.value}>
                          {role.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={additionalForm.control}
              name="marketingConsent"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 mt-6">
                  <FormControl>
                    <Checkbox 
                      checked={field.value}
                      onCheckedChange={field.onChange} 
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="font-normal text-sm">
                      I agree to receive information and updates about ELIA GO products and services
                    </FormLabel>
                  </div>
                </FormItem>
              )}
            />
            
            <FormField
              control={additionalForm.control}
              name="termsConsent"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox 
                      checked={field.value}
                      onCheckedChange={field.onChange} 
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="font-normal text-sm">
                      I accept the <a href="/terms" className="text-primary underline">Terms and Conditions</a> and <a href="/privacy" className="text-primary underline">Privacy Policy</a>
                    </FormLabel>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />
            
            <div className="flex flex-row gap-3 pt-4">
              <Button type="button" variant="outline" onClick={handleBack} className="w-1/2">
                Back
              </Button>
              <Button type="submit" className="w-1/2" disabled={isLoading}>
                {isLoading ? "Creating account..." : "Create account"}
              </Button>
            </div>
          </form>
        </Form>
      )}
    </div>
  );
}
