
import * as z from "zod";

export const materialitySchema = z.object({
  companyName: z.string().min(2, {
    message: "Company name must be at least 2 characters.",
  }),
  materialIssues: z.string().min(10, {
    message: "Please describe your material issues in detail.",
  }),
  impactOnBusiness: z.coerce.number().min(0).max(10),
  impactOnStakeholders: z.coerce.number().min(0).max(10),
  stakeholderFeedback: z.string().optional(),
});

export type MaterialityFormValues = z.infer<typeof materialitySchema>;
