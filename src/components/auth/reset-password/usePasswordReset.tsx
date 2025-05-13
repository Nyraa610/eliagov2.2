import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";
import { emailService } from "@/services/emailService";

export const usePasswordReset = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    const handlePasswordReset = async () => {
      try {
        // Check if we have a hash fragment with access_token
        const hash = window.location.hash;
        if (!hash) {
          console.error("No hash fragment found in URL");
          throw new Error("No hash fragment found in URL");
        }

        // Parse the hash to get the access token
        const hashParams = new URLSearchParams(hash.substring(1));
        const accessToken = hashParams.get("access_token");
        const refreshToken = hashParams.get("refresh_token");
        
        console.log("Hash params found:", {
          hasAccessToken: !!accessToken,
          hasRefreshToken: !!refreshToken,
          hashLength: hash.length
        });
        
        if (!accessToken) {
          console.error("No access token found in URL");
          throw new Error("No access token found in URL");
        }
        
        // Set the session with the access token
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken || "",
        });

        if (error) {
          console.error("Error setting session:", error);
          throw error;
        }

        // Validation successful
        setIsInitialized(true);
      } catch (error: any) {
        console.error("Password reset initialization error:", error);
        toast({
          variant: "destructive",
          title: "Invalid reset link",
          description: "The password reset link is invalid or has expired. Please request a new one.",
        });
        navigate("/login");
      }
    };

    handlePasswordReset();
  }, [navigate, toast, location]);

  const validatePassword = (password: string) => {
    if (password.length < 8) {
      return "Password must be at least 8 characters long";
    }
    if (!/[A-Z]/.test(password)) {
      return "Password must contain at least one uppercase letter";
    }
    if (!/[a-z]/.test(password)) {
      return "Password must contain at least one lowercase letter";
    }
    if (!/[0-9]/.test(password)) {
      return "Password must contain at least one number";
    }
    return null;
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate password
    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    // Check if passwords match
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);

    try {
      // Get the current session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        console.error("No active session found");
        throw new Error("No active session found. Please try resetting your password again.");
      }

      console.log("Updating password for user:", session.user.email);
      
      // Update the user's password
      const { error } = await supabase.auth.updateUser({
        password,
      });

      if (error) {
        console.error("Password update error:", error);
        throw error;
      }

      console.log("Password updated successfully");
      
      toast({
        title: "Password updated successfully",
        description: "You can now log in with your new password",
      });
      
      // Send password change confirmation email
      try {
        if (session.user.email) {
          const { error: emailError } = await emailService.sendEmail({
            to: session.user.email,
            subject: "Your password has been updated",
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h1 style="color: #4F46E5;">Password Updated</h1>
                <p>Hello,</p>
                <p>Your ELIA GO account password has been successfully updated.</p>
                <p>If you did not make this change, please contact support immediately.</p>
                <p>Best regards,<br>The ELIA GO Team</p>
              </div>
            `
          });
          
          if (emailError) {
            console.error("Failed to send password change confirmation:", emailError);
          }
        }
      } catch (emailError) {
        console.error("Exception sending password change email:", emailError);
        // Don't block the flow if email fails
      }
      
      // Sign out the user after successful password reset
      await supabase.auth.signOut();
      
      // Redirect to login
      navigate("/login");
    } catch (error: any) {
      console.error("Password reset error:", error);
      toast({
        variant: "destructive",
        title: "Password reset failed",
        description: error.message || "An unexpected error occurred. Please try again.",
      });
      setError(error.message || "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    isLoading,
    error,
    isInitialized,
    handleResetPassword,
    navigateToLogin: () => navigate("/login")
  };
};

est ce qu'il ya un probleme dans ce code  ?
