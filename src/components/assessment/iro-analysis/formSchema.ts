
import * as z from "zod";

// Define the schema for risk assessment methodology configuration
export const methodologySchema = z.object({
  impactScale: z.array(z.object({
    value: z.number(),
    label: z.string(),
    description: z.string(),
  })).default([
    { value: 1, label: "Low", description: "Minimal impact to the organization" },
    { value: 2, label: "Medium", description: "Moderate impact requiring attention" },
    { value: 3, label: "High", description: "Significant impact requiring immediate action" },
  ]),
  likelihoodScale: z.array(z.object({
    value: z.number(),
    label: z.string(),
    description: z.string(),
  })).default([
    { value: 1, label: "Unlikely", description: "Very low probability of occurrence" },
    { value: 2, label: "Possible", description: "May occur under certain conditions" },
    { value: 3, label: "Likely", description: "High probability of occurrence" },
  ]),
});

// Define the schema for a single risk or opportunity
export const iroItemSchema = z.object({
  id: z.string().uuid().optional(),
  issueTitle: z.string().min(2, "Title is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  impact: z.number().min(1).max(3),
  likelihood: z.number().min(1).max(3),
  riskScore: z.number().optional(),
  type: z.enum(["risk", "opportunity"]),
  category: z.string(),
  mitigationMeasures: z.string().optional(),
});

// Define the schema for the entire IRO form
export const iroFormSchema = z.object({
  methodology: methodologySchema,
  items: z.array(iroItemSchema),
});

export type MethodologyConfig = z.infer<typeof methodologySchema>;
export type IROItem = z.infer<typeof iroItemSchema>;
export type IROFormValues = z.infer<typeof iroFormSchema>;

// Helper function to calculate risk score
export const calculateRiskScore = (impact: number, likelihood: number): number => {
  return impact * likelihood;
};
