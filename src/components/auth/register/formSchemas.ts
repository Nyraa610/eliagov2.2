
import { z } from "zod";

// First step form schema definition
export const basicInfoSchema = z.object({
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
export const additionalInfoSchema = z.object({
  department: z.string().min(1, "Please select a department"),
  persona: z.string().min(1, "Please select your role"),
  marketingConsent: z.boolean().optional(),
  termsConsent: z.boolean().refine(val => val === true, {
    message: "You must accept the terms and conditions to continue",
  }),
});

// Combined schema type for all form data
export type RegisterFormData = z.infer<typeof basicInfoSchema> & z.infer<typeof additionalInfoSchema>;
