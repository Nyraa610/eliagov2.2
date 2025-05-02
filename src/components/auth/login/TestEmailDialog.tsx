
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
import { InfoIcon, AlertCircleIcon, CheckCircleIcon, ClockIcon } from "lucide-react";

const formSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type FormValues = z.infer<typeof formSchema>;

interface TestEmailDialogProps {
  open: boolean;
  onClose: () => void;
}

export function TestEmailDialog({ open, onClose }: TestEmailDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState("");
  const [details, setDetails] = useState<any>(null);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  const handleSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    setStatus('pending');
    setMessage("Sending test email...");
    setDetails(null);
    
    try {
      console.log("Sending test email to:", values.email);
      const result = await emailService.sendTestEmail(values.email);
      console.log("Test email result:", result);
      
      setDetails(result.details);
      
      if (result.success) {
        setStatus('success');
        setMessage(`Test email sent successfully to ${values.email}`);
      } else {
        setStatus('error');
        setMessage(result.error || "Failed to send test email. Please check your email configuration.");
      }
    } catch (error: any) {
      console.error("Test email error:", error);
      setStatus('error');
      setMessage("An unexpected error occurred. Please try again later.");
      setDetails({ error: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Test Email Configuration</DialogTitle>
          <DialogDescription>
            Send a test email to verify your email configuration is working correctly.
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
                <AlertTitle>Sending...</AlertTitle>
                <AlertDescription>{message}</AlertDescription>
              </Alert>
            )}
            
            {status === 'success' && (
              <Alert className="border-green-500 bg-green-50 text-green-800">
                <CheckCircleIcon className="h-4 w-4" />
                <AlertTitle>Success</AlertTitle>
                <AlertDescription>
                  {message}
                  {details && details.duration && (
                    <div className="mt-2 text-xs">
                      Sent in {details.duration}ms
                    </div>
                  )}
                </AlertDescription>
              </Alert>
            )}
            
            {status === 'error' && (
              <Alert className="border-destructive bg-destructive/10">
                <AlertCircleIcon className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                  {message}
                  
                  {details && (
                    <div className="mt-2 text-xs overflow-auto max-h-32 p-2 bg-gray-100 rounded">
                      <pre className="whitespace-pre-wrap">
                        {JSON.stringify(details, null, 2)}
                      </pre>
                    </div>
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
                Close
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting}
              >
                {isSubmitting ? "Sending..." : "Send Test Email"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
