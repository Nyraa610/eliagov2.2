
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { emailService } from "@/services/emailService";
import { ScrollArea } from "@/components/ui/scroll-area";

export function TestEmailDialog() {
  const [isSending, setIsSending] = useState(false);
  const [testEmail, setTestEmail] = useState("");
  const [testResult, setTestResult] = useState<null | {
    success: boolean;
    message: string;
    details?: any;
  }>(null);
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
    setTestResult(null);
    
    try {
      console.log("Sending test email to:", testEmail);
      
      const response = await emailService.sendTestEmail(testEmail);
      
      if (!response.success) {
        console.error("Test email failed:", response.error);
        setTestResult({
          success: false,
          message: `Failed to send test email: ${response.error || "Unknown error"}`,
          details: response
        });
        throw new Error(response.error || "Failed to send test email");
      }
      
      setTestResult({
        success: true,
        message: "Test email sent successfully! Check your inbox.",
        details: response
      });
      
      toast({
        title: "Test email sent",
        description: "Check your inbox for the test email",
      });
    } catch (error: any) {
      console.error("Test email error:", error);
      setTestResult({
        success: false,
        message: error.message || "An unexpected error occurred",
        details: error
      });
      
      toast({
        variant: "destructive",
        title: "Test email failed",
        description: error.message || "An unexpected error occurred",
      });
    } finally {
      setIsSending(false);
    }
  };

  const closeDialog = () => {
    const dialog = document.getElementById('testEmailDialog');
    if (dialog instanceof HTMLDialogElement) {
      dialog.close();
    }
    setTestResult(null);
  };

  return (
    <dialog id="testEmailDialog" className="modal p-0 rounded-lg shadow-lg backdrop:bg-black/50">
      <div className="bg-white p-6 w-full max-w-2xl rounded-lg">
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
          
          {testResult && (
            <div className={`p-4 rounded-md ${testResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
              <h4 className={`font-medium ${testResult.success ? 'text-green-800' : 'text-red-800'}`}>
                {testResult.success ? 'Success' : 'Error'}
              </h4>
              <p className="text-sm my-2">{testResult.message}</p>
              
              {testResult.details && (
                <ScrollArea className="h-40 mt-2 rounded bg-black/5 p-2">
                  <pre className="text-xs font-mono">
                    {JSON.stringify(testResult.details, null, 2)}
                  </pre>
                </ScrollArea>
              )}
            </div>
          )}
          
          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={closeDialog}
            >
              Close
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
