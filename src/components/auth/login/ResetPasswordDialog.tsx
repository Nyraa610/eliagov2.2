
import { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InfoIcon, AlertCircleIcon, CheckCircleIcon, ClockIcon } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";

const formSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type FormValues = z.infer<typeof formSchema>;

interface ResetPasswordDialogProps {
  open: boolean;
  onClose: () => void;
}

export function ResetPasswordDialog({ open, onClose }: ResetPasswordDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState("");
  const [errorDetails, setErrorDetails] = useState<string | null>(null);
  const { toast } = useToast();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  const handleSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    setStatus('pending');
    setMessage("Sending password reset email...");
    setErrorDetails(null);
    
    try {
      const resetLink = `${window.location.origin}/reset-password`;
      
      console.log("Sending password reset email to:", values.email);
      
      // Use Supabase's built-in password reset functionality
      const { error } = await supabase.auth.resetPasswordForEmail(values.email, {
        redirectTo: resetLink,
      });
      
      if (error) {
        console.error("Password reset error:", error);
        setStatus('error');
        
        // Provide a user-friendly error message
        if (error.message.includes("SMTP") || error.message.includes("email")) {
          setMessage("Failed to send password reset email. Please check with an administrator.");
          setErrorDetails("The email service is currently unavailable. This is likely a configuration issue.");
        } else if (error.message.includes("rate limit")) {
          setMessage("Too many reset attempts. Please wait a few minutes before trying again.");
        } else if (error.message.includes("not found") || error.message.includes("doesn't exist")) {
          setMessage("If an account exists with this email, a password reset link will be sent.");
        } else {
          setMessage("Failed to send password reset email. Please try again later.");
          setErrorDetails(error.message);
        }
        
        // Log the error for troubleshooting
        console.error("Password reset error details:", {
          error: error.message,
          email: values.email
        });
      } else {
        setStatus('success');
        setMessage("If an account exists with this email, a password reset link will be sent.");
        form.reset();
        
        toast({
          title: "Password reset email sent",
          description: "Please check your inbox for further instructions",
        });
      }
    } catch (error: any) {
      console.error("Password reset exception:", error);
      setStatus('error');
      setMessage("An unexpected error occurred. Please try again later.");
      setErrorDetails(error.message || "Unknown error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Reset Password</DialogTitle>
          <DialogDescription>
            Enter your email address and we'll send you a link to reset your password.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <Label htmlFor="email">Email</Label>
                  <FormControl>
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder="name@example.com" 
                      {...field} 
                      autoComplete="email"
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {status === 'pending' && (
              <Alert>
                <ClockIcon className="h-4 w-4" />
                <AlertTitle>Processing</AlertTitle>
                <AlertDescription>{message}</AlertDescription>
              </Alert>
            )}
            
            {status === 'success' && (
              <Alert className="border-green-500 bg-green-50 text-green-800">
                <CheckCircleIcon className="h-4 w-4" />
                <AlertTitle>Success</AlertTitle>
                <AlertDescription>{message}</AlertDescription>
              </Alert>
            )}
            
            {status === 'error' && (
              <Alert className="border-destructive bg-destructive/10">
                <AlertCircleIcon className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                  {message}
                  {errorDetails && (
                    <details className="mt-2 text-xs">
                      <summary>Technical details</summary>
                      <div className="mt-1 p-2 bg-gray-100 rounded">
                        {errorDetails}
                      </div>
                    </details>
                  )}
                </AlertDescription>
              </Alert>
            )}
            
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting}
              >
                {isSubmitting ? "Sending..." : "Send Reset Link"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
