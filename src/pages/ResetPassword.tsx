import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Navigation } from "@/components/Navigation";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";

// Password reset form schema
const resetPasswordSchema = z.object({
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;

export default function ResetPassword() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);
  const [isValidToken, setIsValidToken] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Use the useForm hook with zod resolver
  const form = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  // Parse token from URL on component mount
  useEffect(() => {
    async function verifyResetToken() {
      try {
        setIsVerifying(true);
        
        // Extract the access token from the URL
        // The URL format is typically: /reset-password#access_token=xxx&type=recovery
        const hashParams = new URLSearchParams(location.hash.substring(1));
        const accessToken = hashParams.get("access_token");
        const tokenType = hashParams.get("type");
        
        if (!accessToken || tokenType !== "recovery") {
          toast({
            variant: "destructive",
            title: "Invalid reset link",
            description: "Please request a new password reset link.",
          });
          navigate("/login");
          return;
        }
        
        // Verify the token by getting the user's session
        const { data, error } = await supabase.auth.getUser(accessToken);
        
        if (error || !data.user) {
          console.error("Error verifying reset token:", error);
          toast({
            variant: "destructive",
            title: "Invalid or expired reset link",
            description: "Please request a new password reset link.",
          });
          navigate("/login");
          return;
        }
        
        // Token is valid
        setIsValidToken(true);
      } catch (error) {
        console.error("Error during token verification:", error);
        toast({
          variant: "destructive",
          title: "Error verifying reset link",
          description: "Please request a new password reset link.",
        });
        navigate("/login");
      } finally {
        setIsVerifying(false);
      }
    }
    
    verifyResetToken();
  }, [location.hash, toast, navigate]);

  async function onSubmit(data: ResetPasswordValues) {
    setIsProcessing(true);
    try {
      // Update the user's password
      const { error } = await supabase.auth.updateUser({
        password: data.password,
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Password reset successful",
        description: "Your password has been changed successfully. You can now log in with your new password.",
      });

      // Redirect to login page
      navigate("/login");
    } catch (error: any) {
      console.error("Error resetting password:", error);
      
      // More specific error messages
      let errorMessage = "An unexpected error occurred. Please try again.";
      
      if (error.message.includes("expired")) {
        errorMessage = "Your password reset link has expired. Please request a new one.";
      } else if (error.message.includes("invalid")) {
        errorMessage = "Invalid reset link. Please request a new password reset link.";
      }
      
      toast({
        variant: "destructive",
        title: "Failed to reset password",
        description: errorMessage,
      });
    } finally {
      setIsProcessing(false);
    }
  }

  if (isVerifying) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-sage-light/10 to-mediterranean-light/10">
        <Navigation />
        <main className="container mx-auto px-4 py-16 md:py-24">
          <div className="max-w-md mx-auto flex flex-col items-center justify-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-gray-600">Verifying your reset link...</p>
          </div>
        </main>
      </div>
    );
  }

  if (!isValidToken) {
    return null; // This will prevent flash of content before redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sage-light/10 to-mediterranean-light/10">
      <Navigation />
      
      <main className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-md mx-auto space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold text-primary">Reset Your Password</h1>
            <p className="text-gray-600">
              Please enter your new password below
            </p>
          </div>

          <div className="bg-white/60 backdrop-blur-sm p-6 md:p-8 rounded-xl border border-gray-200 shadow-sm">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>New Password</FormLabel>
                      <FormControl>
                        <Input 
                          type="password" 
                          placeholder="••••••••" 
                          disabled={isProcessing}
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm New Password</FormLabel>
                      <FormControl>
                        <Input 
                          type="password" 
                          placeholder="••••••••" 
                          disabled={isProcessing}
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Resetting...
                    </>
                  ) : (
                    "Reset Password"
                  )}
                </Button>
              </form>
            </Form>
          </div>
        </div>
      </main>
    </div>
  );
}
