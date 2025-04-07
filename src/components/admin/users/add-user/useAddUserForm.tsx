
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { emailService } from "@/services/emailService";

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
  toast: any; // Add toast to the interface
}

export function useAddUserForm({
  setIsSubmitting,
  onOpenChange,
  onUserAdded,
  toast,
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
        .select('id, email, role')
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
          console.error("Failed to update user role:", updateError);
          throw new Error("Failed to update user role: " + updateError.message);
        }
        
        toast({
          description: `User ${values.email}'s role has been updated to ${values.role}.`,
        });
      } else {
        console.log("Creating new user with role:", values.role);
        
        // Instead of using admin.createUser directly, use a more reliable approach
        // by leveraging Supabase's signUp method and custom RPC function
        
        try {
          // First attempt to create the user via a custom RPC function
          // This requires a server-side function that has proper permissions
          const { data: userData, error: rpcError } = await supabase.rpc('create_new_user', {
            user_email: values.email,
            user_role: values.role
          });
          
          if (rpcError) {
            console.error("RPC error creating user:", rpcError);
            // Fall back to the original method if RPC fails
            throw rpcError;
          }
          
          userId = userData.id;
          
          console.log("User created via RPC function:", userId);
        } catch (rpcFailure) {
          // Fall back to original method
          console.log("Falling back to alternative method due to:", rpcFailure);
          
          // Create the auth user with a temporary password
          const tempPassword = Math.random().toString(36).slice(2) + Math.random().toString(36).toUpperCase().slice(2) + "!1";
          
          try {
            // Try using the service role client if available (requires server-side function)
            const { error: serviceRoleError } = await supabase.functions.invoke('create-user', {
              body: {
                email: values.email,
                password: tempPassword,
                role: values.role  // Make sure to pass the correct role
              }
            });
            
            if (serviceRoleError) {
              throw serviceRoleError;
            }
            
            // Fetch the newly created user to get their ID
            const { data: newUser, error: fetchError } = await supabase
              .from('profiles')
              .select('id')
              .eq('email', values.email)
              .single();
              
            if (fetchError) {
              throw new Error("Failed to fetch newly created user: " + fetchError.message);
            }
            
            userId = newUser.id;
          } catch (finalError: any) {
            console.error("All user creation methods failed:", finalError);
            throw new Error("Unable to create user. Please contact your system administrator.");
          }
        }

        if (values.sendInvitation) {
          try {
            // Send invitation email
            const { error: inviteError } = await supabase.functions.invoke('send-invitation', {
              body: {
                email: values.email,
                role: values.role  // Make sure role is passed to invitation
              }
            });
            
            if (inviteError) {
              console.error("Error sending invitation:", inviteError);
              toast({
                description: "User created but invitation email could not be sent.",
                variant: "warning"
              });
            }

            // Also send a custom email via our email service
            try {
              const { data: session } = await supabase.auth.getSession();
              const { data: inviterProfile } = await supabase
                .from('profiles')
                .select('full_name, company_id')
                .eq('id', session?.session?.user?.id)
                .single();
                
              if (inviterProfile?.company_id) {
                const { data: companyData } = await supabase
                  .from('companies')
                  .select('name')
                  .eq('id', inviterProfile.company_id)
                  .single();
                  
                const inviterName = inviterProfile?.full_name || 'An administrator';
                const companyName = companyData?.name || 'their organization';
                
                await emailService.sendInvitationEmail(
                  values.email,
                  inviterName,
                  companyName
                );
              }
            } catch (emailError) {
              console.error("Failed to send custom invitation email:", emailError);
              // Don't block user creation if email sending fails
            }
          } catch (inviteError) {
            console.error("Failed to send invitation:", inviteError);
            toast({
              description: "User created but invitation email could not be sent.",
              variant: "warning"
            });
          }
        }
        
        toast({
          description: `User account for ${values.email} created successfully.`,
        });
      }

      // Notify the user
      if (existingProfiles) {
        await sendUserNotification(userId, "You have been added to a new organization");
      }

      form.reset();
      onOpenChange(false);
      onUserAdded();
    } catch (error: any) {
      console.error("Error creating/updating user:", error);
      toast({
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
