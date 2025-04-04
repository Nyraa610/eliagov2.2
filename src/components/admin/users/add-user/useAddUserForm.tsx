
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

// Form validation schema
const addUserSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  role: z.enum(["user", "admin", "client_admin", "consultant"] as const),
  sendInvitation: z.boolean().default(true),
});

export type AddUserFormValues = z.infer<typeof addUserSchema>;

interface UseAddUserFormProps {
  setIsSubmitting: (isSubmitting: boolean) => void;
  onOpenChange: (open: boolean) => void;
  onUserAdded: () => void;
}

export function useAddUserForm({
  setIsSubmitting,
  onOpenChange,
  onUserAdded,
}: UseAddUserFormProps) {
  const form = useForm<AddUserFormValues>({
    resolver: zodResolver(addUserSchema),
    defaultValues: {
      email: "",
      role: "user",
      sendInvitation: true,
    },
  });

  const onSubmit = async (values: AddUserFormValues) => {
    try {
      setIsSubmitting(true);

      // Check if the user already exists in the system
      const { data: existingProfiles, error: profileError } = await supabase
        .from('profiles')
        .select('id, email')
        .eq('email', values.email)
        .maybeSingle();
      
      if (profileError) {
        console.error("Error checking existing user:", profileError);
        throw new Error("Error checking if user exists: " + profileError.message);
      }

      let userId;
      
      if (existingProfiles) {
        console.log("User already exists, updating role");
        userId = existingProfiles.id;
        
        // Update the user's role in the profiles table
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ role: values.role })
          .eq('id', userId);
          
        if (updateError) {
          throw new Error("Failed to update user role: " + updateError.message);
        }
      } else {
        console.log("Creating new user");
        // Create a new user with a temporary password
        const tempPassword = Math.random().toString(36).slice(2) + Math.random().toString(36).toUpperCase().slice(2) + "!1";
        
        // Create the auth user
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
          email: values.email,
          password: tempPassword,
          email_confirm: true,
          user_metadata: {
            role: values.role
          }
        });
        
        if (authError) {
          console.error("Error creating auth user:", authError);
          throw new Error("Failed to create user: " + authError.message);
        }
        
        userId = authData.user.id;

        if (values.sendInvitation) {
          // Send invitation email
          const { error: inviteError } = await supabase.auth.admin.inviteUserByEmail(values.email);
          
          if (inviteError) {
            console.error("Error sending invitation:", inviteError);
            // This is not a fatal error, so we just log it
            toast({
              title: "Warning",
              description: "User created but invitation email could not be sent.",
              variant: "warning"
            });
          }
        }
      }

      // Notify the user
      if (existingProfiles) {
        await sendUserNotification(userId, "You have been added to a new organization");
      }

      toast({
        title: "Success",
        description: existingProfiles 
          ? `User ${values.email} has been updated and notified.`
          : `User account for ${values.email} created successfully.`,
      });

      form.reset();
      onOpenChange(false);
      onUserAdded();
    } catch (error: any) {
      console.error("Error creating/updating user:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to manage user",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper function to send notification to user
  const sendUserNotification = async (userId: string, message: string) => {
    try {
      const { data: session } = await supabase.auth.getSession();
      
      if (!session?.session?.user) {
        console.error("No authenticated user to send notification");
        return;
      }

      const { error } = await supabase
        .from("notifications")
        .insert({
          user_id: userId,
          sender_id: session.session.user.id,
          notification_type: "message",
          title: "Organization Access",
          message: message,
          is_read: false
        });

      if (error) {
        console.error("Error sending notification:", error);
      }
    } catch (error) {
      console.error("Error in sendUserNotification:", error);
    }
  };

  return { form, onSubmit };
}
