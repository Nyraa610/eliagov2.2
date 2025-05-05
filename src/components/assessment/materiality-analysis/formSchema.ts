
import * as z from "zod";

// Define the schema for a materiality issue
export const materialityIssueSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(2, { message: "Issue title is required." }),
  description: z.string().optional(),
  financialMateriality: z.number().min(0).max(10),
  impactMateriality: z.number().min(0).max(10),
  maturity: z.number().min(0).max(10).optional(),
  category: z.string().optional(),
});

export type MaterialityIssue = z.infer<typeof materialityIssueSchema>;

export const materialitySchema = z.object({
  companyName: z.string().min(2, {
    message: "Company name must be at least 2 characters.",
  }),
  industry: z.string().optional(),
  materialIssues: z.array(materialityIssueSchema).default([]),
  stakeholderFeedback: z.string().optional(),
  customIssueInput: z.string().optional(),
  // Add the missing fields that we're trying to use in forms
  impactOnBusiness: z.number().min(0).max(10).optional(),
  impactOnStakeholders: z.number().min(0).max(10).optional(),
});

export type MaterialityFormValues = z.infer<typeof materialitySchema>;
