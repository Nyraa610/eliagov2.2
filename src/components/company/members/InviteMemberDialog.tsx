
import { useState } from "react";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { UserPlus, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserRole } from "@/services/base/profileTypes";

interface InviteMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companyId: string;
  onInviteSuccess?: () => void;
}

const inviteFormSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  role: z.string().default("user"),
});

type InviteFormValues = z.infer<typeof inviteFormSchema>;

export function InviteMemberDialog({ 
  open, 
  onOpenChange, 
  companyId, 
  onInviteSuccess 
}: InviteMemberDialogProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<InviteFormValues>({
    resolver: zodResolver(inviteFormSchema),
    defaultValues: {
      email: "",
      role: "user",
    },
  });

  const handleInvite = async (values: InviteFormValues) => {
    if (!companyId) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Company ID is required to send an invitation.",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Get current user info to include in the invitation
      const { data: { user } } = await supabase.auth.getUser();
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('full_name, email')
        .eq('id', user?.id)
        .single();
        
      const inviterInfo = {
        id: user?.id,
        name: userProfile?.full_name || user?.email?.split('@')[0] || 'Company Admin',
        email: userProfile?.email || user?.email || ''
      };

      // First check if the user already exists
      const { data: existingUsers, error: userError } = await supabase
        .from('profiles')
        .select('id, email')
        .eq('email', values.email.toLowerCase());
        
      if (userError) {
        throw new Error(userError.message);
      }
      
      if (existingUsers && existingUsers.length > 0) {
        // User exists, add them to the company
        const userId = existingUsers[0].id;
        
        // Check if user is already in this company
        const { data: existingMember, error: memberError } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', userId)
          .eq('company_id', companyId)
          .single();
          
        if (memberError && memberError.code !== 'PGRST116') {
          throw new Error(memberError.message);
        }
        
        if (existingMember) {
          toast({
            variant: "default",
            title: "User Already Member",
            description: "This user is already a member of this company.",
          });
          setIsSubmitting(false);
          return;
        }
        
        // Add user to company
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ 
            company_id: companyId,
            is_company_admin: values.role === 'admin',
            role: values.role as UserRole
          })
          .eq('id', userId);
          
        if (updateError) {
          throw new Error(updateError.message);
        }
        
        toast({
          title: "Success",
          description: "User added to company successfully.",
        });
      } else {
        // User doesn't exist, send invitation
        const { data, error } = await supabase.functions.invoke("send-invitation", {
          body: { 
            email: values.email,
            companyId,
            role: values.role,
            inviterInfo: inviterInfo
          }
        });
        
        if (error) {
          throw new Error(error.message);
        }
        
        toast({
          title: "Invitation Sent",
          description: `An invitation has been sent to ${values.email}`,
        });
      }
      
      // Reset form and close dialog
      form.reset();
      onOpenChange(false);
      
      // Call success callback if provided
      if (onInviteSuccess) {
        onInviteSuccess();
      }
      
    } catch (error) {
      console.error("Error inviting user:", error);
      toast({
        variant: "destructive",
        title: "Invitation Failed",
        description: error instanceof Error ? error.message : "Failed to send invitation. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm">
          <UserPlus className="h-4 w-4 mr-2" />
          Invite Member
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite New Member</DialogTitle>
          <DialogDescription>
            Enter the email address of the person you want to invite to this company.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleInvite)} className="space-y-4 py-2">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email address</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="colleague@example.com" 
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    We'll send an invitation to this email address.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="user">Company Member</SelectItem>
                      <SelectItem value="admin">Company Admin</SelectItem>
                      <SelectItem value="consultant">Consultant</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Select the role for this user.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => onOpenChange(false)} 
                type="button"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Send Invitation
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
