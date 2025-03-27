
import { z } from "zod";

export const carbonEvaluationSchema = z.object({
  // Common fields
  companyName: z.string().min(2, "Company name is required"),
  yearOfEvaluation: z.string().regex(/^\d{4}$/, "Must be a valid year"),
  framework: z.string().optional(),
  
  // Original GHG Protocol framework fields
  scope1Emissions: z.string().optional(),
  scope2Emissions: z.string().optional(),
  scope3Emissions: z.string().optional(),
  transportationUsage: z.string().optional(),
  
  // Elia Carbon Evaluation framework fields - Framing
  evaluationObjective: z.string().optional(),
  additionalObjectives: z.string().optional(),
  
  // Elia Carbon Evaluation framework fields - Scoping
  organizationalBoundary: z.string().optional(),
  operationalBoundary: z.string().optional(),
  includedScopes: z.array(z.string()).optional(),
  exclusions: z.string().optional(),
  
  // Elia Carbon Evaluation framework fields - Stakeholders
  internalStakeholders: z.string().optional(),
  externalStakeholders: z.string().optional(),
  projectLead: z.string().optional(),
  dataContributors: z.string().optional(),
  
  // Elia Carbon Evaluation framework fields - Carbon Data
  fuelConsumption: z.string().optional(),
  refrigerantEmissions: z.string().optional(),
  electricityConsumption: z.string().optional(),
  heatingSteamConsumption: z.string().optional(),
  purchasedGoods: z.string().optional(),
  businessTravel: z.string().optional(),
  employeeCommuting: z.string().optional(),
  wasteGenerated: z.string().optional(),
  
  // Elia Carbon Evaluation framework fields - Synthesis
  emissionHotspots: z.string().optional(),
  reductionOpportunities: z.string().optional(),
  benchmarkComparison: z.string().optional(),
  recommendedActions: z.string().optional(),
  
  // Elia Carbon Evaluation framework fields - Methodology
  dataQuality: z.string().optional(),
  emissionFactors: z.string().optional(),
  assumptions: z.string().optional(),
  verificationStatus: z.string().optional(),
  nextEvaluation: z.string().optional(),
});

export type CarbonEvaluationFormValues = z.infer<typeof carbonEvaluationSchema>;
