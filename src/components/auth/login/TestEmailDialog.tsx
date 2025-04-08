
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { emailService } from "@/services/emailService";

export function TestEmailDialog() {
  const [isSending, setIsSending] = useState(false);
  const [testEmail, setTestEmail] = useState("");
  const { toast } = useToast();

  const handleSendTestEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!testEmail || !testEmail.includes('@')) {
      toast({
        variant: "destructive",
        title: "Invalid email",
        description: "Please enter a valid email address",
      });
      return;
    }
    
    setIsSending(true);
    
    try {
      console.log("Sending test email to:", testEmail);
      
      const { success, error } = await emailService.sendTestEmail(testEmail);
      
      if (!success) {
        console.error("Test email failed:", error);
        throw new Error(error || "Failed to send test email");
      }
      
      toast({
        title: "Test email sent",
        description: "Check your inbox for the test email",
      });
      
      setTestEmail("");
      
      // Close the dialog
      const dialog = document.getElementById('testEmailDialog');
      if (dialog instanceof HTMLDialogElement) {
        dialog.close();
      }
    } catch (error: any) {
      console.error("Test email error:", error);
      toast({
        variant: "destructive",
        title: "Test email failed",
        description: error.message || "An unexpected error occurred",
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <dialog id="testEmailDialog" className="modal p-0 rounded-lg shadow-lg backdrop:bg-black/50">
      <div className="bg-white p-6 w-full max-w-md rounded-lg">
        <h3 className="text-xl font-bold mb-4">Test SMTP Configuration</h3>
        <p className="text-gray-600 mb-4">
          Enter an email address to send a test message and verify your SMTP configuration.
        </p>
        
        <form onSubmit={handleSendTestEmail} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="test-email">Email</Label>
            <Input 
              id="test-email" 
              type="email" 
              value={testEmail} 
              onChange={(e) => setTestEmail(e.target.value)}
              placeholder="your@email.com"
              required
            />
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                const dialog = document.getElementById('testEmailDialog');
                if (dialog instanceof HTMLDialogElement) {
                  dialog.close();
                }
              }}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSending}>
              {isSending ? "Sending..." : "Send Test Email"}
            </Button>
          </div>
        </form>
      </div>
    </dialog>
  );
}
