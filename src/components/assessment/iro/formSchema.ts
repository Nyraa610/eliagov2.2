
import { z } from "zod";

export const iroSchema = z.object({
  // Impact Assessment
  companyActivities: z.string().min(10, "Please provide a description of your company's activities"),
  companyImpacts: z.string().min(10, "Please provide a description of your company's impacts"),
  
  // Risk Assessment
  identifiedRisks: z.string().min(10, "Please describe the identified risks"),
  riskProbability: z.number().min(1).max(5),
  riskSeverity: z.number().min(1).max(5),
  
  // Opportunity Assessment
  identifiedOpportunities: z.string().min(10, "Please describe the identified opportunities"),
  opportunityRelevance: z.number().min(1).max(5),
  opportunityValue: z.number().min(1).max(5),
  
  // CRM Integration
  includeCrmData: z.boolean().optional().default(false),
  salesOpportunityIds: z.array(z.string()).optional(),
});

export type IROFormValues = z.infer<typeof iroSchema>;
