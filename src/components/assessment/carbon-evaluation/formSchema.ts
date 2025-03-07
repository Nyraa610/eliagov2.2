
import * as z from "zod";

export const carbonEvaluationSchema = z.object({
  companyName: z.string().min(2, {
    message: "Company name must be at least 2 characters.",
  }),
  yearOfEvaluation: z.string().min(4, {
    message: "Please enter a valid year.",
  }),
  scope1Emissions: z.string().optional(),
  scope2Emissions: z.string().optional(),
  scope3Emissions: z.string().optional(),
  transportationUsage: z.string().optional(),
});

export type CarbonEvaluationFormValues = z.infer<typeof carbonEvaluationSchema>;
