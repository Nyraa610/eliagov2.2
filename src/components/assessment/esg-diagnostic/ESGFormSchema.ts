
import * as z from "zod";

export const esgFormSchema = z.object({
  // Company Context (companyName now optional as we'll get it from user profile)
  companyName: z.string().optional(),
  industry: z.string().min(2, {
    message: "Industry must be at least 2 characters.",
  }),
  employeeCount: z.string().min(1, {
    message: "Please select the number of employees.",
  }),
  
  // Environmental Practices
  wasteManagement: z.string().optional(),
  carbonFootprint: z.string().optional(),
  renewableEnergy: z.string().optional(),
  
  // Social Responsibility
  employeeWellbeing: z.string().optional(),
  communityEngagement: z.string().optional(),
  diversityInitiatives: z.string().optional(),
  
  // Governance
  independentBoard: z.string().optional(),
  transparencyPractices: z.string().optional(),
  ethicalDecisionMaking: z.string().optional(),
  
  // Goals and Objectives
  mainGoals: z.string().optional(),
  existingInitiatives: z.string().optional(),
});

export type ESGFormValues = z.infer<typeof esgFormSchema>;
