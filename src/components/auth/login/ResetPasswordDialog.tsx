
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";

export function ResetPasswordDialog() {
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const { toast } = useToast();

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!resetEmail || !resetEmail.includes('@')) {
      toast({
        variant: "destructive",
        title: "Invalid email",
        description: "Please enter a valid email address",
      });
      return;
    }
    
    setIsResettingPassword(true);
    
    try {
      console.log("Initiating password reset for:", resetEmail);
      
      // Generate the full reset link
      const origin = window.location.origin;
      const resetLink = `${origin}/reset-password`;
      
      console.log("Reset link will redirect to:", resetLink);
      
      // Use Supabase's built-in password reset
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: resetLink,
      });
      
      if (error) {
        console.error("Password reset error:", error);
        throw new Error(error.message || "Failed to send password reset email");
      }
      
      console.log("Password reset email sent successfully");
      
      toast({
        title: "Password reset email sent",
        description: "Check your inbox for password reset instructions",
      });
      
      setResetEmail("");
      
      // Close the dialog
      const dialog = document.getElementById('resetPasswordDialog');
      if (dialog instanceof HTMLDialogElement) {
        dialog.close();
      }
    } catch (error: any) {
      console.error("Password reset error:", error);
      toast({
        variant: "destructive",
        title: "Password reset failed",
        description: error.message || "An unexpected error occurred. Please try again later.",
      });
    } finally {
      setIsResettingPassword(false);
    }
  };

  return (
    <dialog id="resetPasswordDialog" className="modal p-0 rounded-lg shadow-lg backdrop:bg-black/50">
      <div className="bg-white p-6 w-full max-w-md rounded-lg">
        <h3 className="text-xl font-bold mb-4">Reset Password</h3>
        <p className="text-gray-600 mb-4">
          Enter your email address and we'll send you instructions to reset your password.
        </p>
        
        <form onSubmit={handleResetPassword} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reset-email">Email</Label>
            <Input 
              id="reset-email" 
              type="email" 
              value={resetEmail} 
              onChange={(e) => setResetEmail(e.target.value)}
              placeholder="your@email.com"
              required
            />
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                const dialog = document.getElementById('resetPasswordDialog');
                if (dialog instanceof HTMLDialogElement) {
                  dialog.close();
                }
              }}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isResettingPassword}>
              {isResettingPassword ? "Sending..." : "Send Reset Link"}
            </Button>
          </div>
        </form>
      </div>
    </dialog>
  );
}
