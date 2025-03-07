
import * as z from "zod";

export const actionPlanSchema = z.object({
  companyName: z.string().min(2, {
    message: "Company name must be at least 2 characters.",
  }),
  shortTermGoals: z.string().min(10, {
    message: "Please describe your short-term goals in detail.",
  }),
  midTermGoals: z.string().min(10, {
    message: "Please describe your mid-term goals in detail.",
  }),
  longTermGoals: z.string().min(10, {
    message: "Please describe your long-term goals in detail.",
  }),
  keyInitiatives: z.string().min(10, {
    message: "Please describe your key initiatives in detail.",
  }),
  timeline: z.string().min(10, {
    message: "Please provide your implementation timeline.",
  }),
});

export type ActionPlanFormValues = z.infer<typeof actionPlanSchema>;
