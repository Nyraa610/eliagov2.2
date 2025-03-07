
import * as z from "zod";

export const companyFormSchema = z.object({
  name: z.string().min(2, {
    message: "Company name must be at least 2 characters.",
  }),
  industry: z.string().optional(),
  country: z.string().optional(),
  website: z.string().url({ message: "Please enter a valid URL" }).optional().or(z.literal('')),
  registry_number: z.string().optional(),
  registry_city: z.string().optional(),
});

export type CompanyFormValues = z.infer<typeof companyFormSchema>;
