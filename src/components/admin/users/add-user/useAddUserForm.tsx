
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { supabaseService } from "@/services/base/supabaseService";

// Form validation schema
const addUserSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  role: z.enum(["user", "admin", "client_admin", "consultant"] as const),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .optional(),
});

export type AddUserFormValues = z.infer<typeof addUserSchema>;

interface UseAddUserFormProps {
  setIsSubmitting: (isSubmitting: boolean) => void;
  toast: any;
  onOpenChange: (open: boolean) => void;
  onUserAdded: () => void;
}

export function useAddUserForm({
  setIsSubmitting,
  toast,
  onOpenChange,
  onUserAdded,
}: UseAddUserFormProps) {
  const form = useForm<AddUserFormValues>({
    resolver: zodResolver(addUserSchema),
    defaultValues: {
      email: "",
      role: "user",
      password: "",
    },
  });

  const onSubmit = async (values: AddUserFormValues) => {
    try {
      setIsSubmitting(true);

      // Create the user and profile
      const result = await supabaseService.createUserProfile({
        email: values.email,
        role: values.role,
        password: values.password || undefined,
      });

      if (result.error) {
        console.error("Error creating profile:", result.error);
        throw new Error("Failed to create user profile: " + result.error.message);
      }

      toast({
        title: "Success",
        description: `User account for ${values.email} created successfully.`,
      });

      form.reset();
      onOpenChange(false);
      onUserAdded();
    } catch (error: any) {
      console.error("Error creating user:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to create user",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return { form, onSubmit };
}
