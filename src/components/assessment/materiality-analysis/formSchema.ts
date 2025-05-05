
import * as z from "zod";

// Define the valid categories for materiality issues
export const issueCategories = ["Environmental", "Social", "Governance"] as const;
export type IssueCategory = typeof issueCategories[number];

// Define the schema for a materiality issue
export const materialityIssueSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(2, { message: "Issue title is required." }),
  description: z.string().optional(),
  financialMateriality: z.number().min(0).max(10),
  impactMateriality: z.number().min(0).max(10),
  maturity: z.number().min(0).max(10).optional(),
  category: z.enum(issueCategories).default("Environmental"),
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
});

export type MaterialityFormValues = z.infer<typeof materialitySchema>;
