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
import { Button } from "@/components/ui/button";
import { UserPlus, Loader2, Check, AlertTriangle } from "lucide-react";
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
  const [inviteSuccess, setInviteSuccess] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [inviteWarning, setInviteWarning] = useState<string | null>(null);
  
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
    setInviteSuccess(false);
    setInviteError(null);
    setInviteWarning(null);
    
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

      // Send the invitation request to our edge function
      console.log("Sending invitation to new user:", values.email);
      
      const { data, error } = await supabase.functions.invoke("send-invitation", {
        body: { 
          email: values.email,
          companyId,
          role: values.role,
          inviterInfo: inviterInfo
        }
      });
      
      console.log("Invitation function response:", data, error);
      
      if (error) {
        throw new Error(error.message || "Failed to send invitation");
      }
      
      // Check if it's a duplicate invitation
      if (data && data.code === "DUPLICATE_INVITATION") {
        setInviteWarning(`An invitation has already been sent to ${values.email}. Please wait for the user to respond.`);
        toast({
          title: "Invitation Already Sent",
          description: `An invitation has already been sent to ${values.email}`,
          variant: "default",
        });
        form.reset();
        setTimeout(() => {
          if (onInviteSuccess) onInviteSuccess();
          onOpenChange(false);
          setInviteWarning(null);
        }, 3000);
        return;
      }
      
      // Check for partial success (invitation saved but email failed)
      if (data && data.savedInvitation === true && data.success === false) {
        setInviteWarning(`Invitation saved, but the email notification failed: ${data.error}`);
        toast({
          title: "Partial Success",
          description: "Invitation saved but email delivery failed. User can still join when they login.",
          variant: "default",
        });
        setInviteSuccess(true);
      } else if (data && data.success === true) {
        toast({
          title: "Invitation Sent",
          description: `An invitation has been sent to ${values.email}`,
        });
        setInviteSuccess(true);
      } else {
        throw new Error("Unknown response from invitation service");
      }
      
      // Reset form
      form.reset();
      
      // Wait a moment to show success state before closing dialog
      setTimeout(() => {
        // Call success callback if provided
        if (onInviteSuccess) {
          onInviteSuccess();
        }
        
        // Close dialog
        onOpenChange(false);
        setInviteSuccess(false);
        setInviteWarning(null);
      }, 2000);
      
    } catch (error) {
      console.error("Error inviting user:", error);
      
      // Set the error message for display
      setInviteError(error instanceof Error ? error.message : "Failed to send invitation. Please try again.");
      
      toast({
        variant: "destructive",
        title: "Invitation Failed",
        description: error instanceof Error ? error.message : "Failed to send invitation. Please try again.",
      });
      setInviteSuccess(false);
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
        
        {inviteSuccess ? (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="bg-green-100 dark:bg-green-900/20 rounded-full p-3 mb-4">
              <Check className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Invitation Sent!</h3>
            <p className="text-center text-muted-foreground">
              The invitation has been sent successfully. We'll notify you when they join.
            </p>
            
            {inviteWarning && (
              <div className="mt-4 p-3 bg-yellow-100 dark:bg-yellow-900/20 rounded-md">
                <p className="text-sm text-yellow-700 dark:text-yellow-400">{inviteWarning}</p>
              </div>
            )}
          </div>
        ) : inviteError ? (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="bg-red-100 dark:bg-red-900/20 rounded-full p-3 mb-4">
              <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Invitation Failed</h3>
            <p className="text-center text-muted-foreground">{inviteError}</p>
            <Button 
              variant="outline" 
              onClick={() => setInviteError(null)} 
              className="mt-4"
            >
              Try Again
            </Button>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleInvite)} className="space-y-4 py-2">
              {inviteWarning && (
                <div className="p-3 bg-yellow-100 dark:bg-yellow-900/20 rounded-md mb-4">
                  <p className="text-sm text-yellow-700 dark:text-yellow-400">{inviteWarning}</p>
                </div>
              )}
              
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
        )}
      </DialogContent>
    </Dialog>
  );
}
