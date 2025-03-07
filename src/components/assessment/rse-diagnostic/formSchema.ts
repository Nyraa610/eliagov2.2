
import * as z from "zod";

export const formSchema = z.object({
  companyName: z.string().min(2, {
    message: "Company name must be at least 2 characters.",
  }),
  industry: z.string().min(2, {
    message: "Industry must be at least 2 characters.",
  }),
  employeeCount: z.string().min(1, {
    message: "Please select the number of employees.",
  }),
  currentRSEPractices: z.string().optional(),
  mainChallenges: z.string().optional(),
});

export type FormValues = z.infer<typeof formSchema>;
