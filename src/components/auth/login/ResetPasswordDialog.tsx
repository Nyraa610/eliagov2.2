
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
import { emailService } from "@/services/emailService";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InfoIcon, AlertCircleIcon, CheckCircleIcon } from "lucide-react";

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
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState("");
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  const handleSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    setStatus('idle');
    
    try {
      const resetLink = `${window.location.origin}/reset-password`;
      
      console.log("Sending password reset email to:", values.email);
      const result = await emailService.sendPasswordResetEmail(values.email, resetLink);
      
      console.log("Password reset request result:", result);
      
      if (result.success) {
        setStatus('success');
        setMessage("Password reset email sent successfully. Please check your inbox.");
        form.reset();
      } else {
        setStatus('error');
        setMessage(result.error || "Failed to send password reset email. Please try again later.");
      }
    } catch (error: any) {
      console.error("Password reset error:", error);
      setStatus('error');
      setMessage("An unexpected error occurred. Please try again later.");
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
                <AlertDescription>{message}</AlertDescription>
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
