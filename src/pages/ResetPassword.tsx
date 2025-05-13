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

// Email schema for requesting password reset
const requestResetSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

export default function ResetPassword() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResetMode, setIsResetMode] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get the hash fragment from the URL
  const hash = location.hash;
  
  // Use the useForm hook with zod resolver for password reset
  const resetForm = useForm({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });
  
  // Use the useForm hook for requesting password reset
  const requestForm = useForm({
    resolver: zodResolver(requestResetSchema),
    defaultValues: {
      email: "",
    },
  });

  // Parse token from URL on component mount
  useEffect(() => {
    if (hash) {
      setIsVerifying(true);
      
      // Extract the access token from the URL
      const hashParams = new URLSearchParams(hash.substring(1));
      const accessToken = hashParams.get("access_token");
      const tokenType = hashParams.get("type");
      
      if (!accessToken || tokenType !== "recovery") {
        toast({
          variant: "destructive",
          title: "Invalid reset link",
          description: "Please request a new password reset link.",
        });
        setIsVerifying(false);
        return;
      }
      
      // Verify the token
      supabase.auth.getUser(accessToken)
        .then(({ data, error }) => {
          if (error || !data.user) {
            toast({
              variant: "destructive",
              title: "Invalid or expired reset link",
              description: "Please request a new password reset link.",
            });
            return;
          }
          
          setIsResetMode(true);
        })
        .catch((error) => {
          console.error("Error verifying token:", error);
          toast({
            variant: "destructive",
            title: "Error verifying reset link",
            description: "Please request a new password reset link.",
          });
        })
        .finally(() => {
          setIsVerifying(false);
        });
    }
  }, [hash, toast]);

  async function onResetSubmit(data) {
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
        description: "Your password has been changed successfully.",
      });

      // Redirect to login page
      navigate("/login");
    } catch (error) {
      console.error("Error resetting password:", error);
      toast({
        variant: "destructive",
        title: "Failed to reset password",
        description: error.message || "An unexpected error occurred. Please try again.",
      });
    } finally {
      setIsProcessing(false);
    }
  }
  
  async function onRequestSubmit(data) {
    setIsProcessing(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: window.location.origin + "/reset/password",
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Password reset email sent",
        description: "Please check your email for the reset link.",
      });
    } catch (error) {
      console.error("Error requesting password reset:", error);
      toast({
        variant: "destructive",
        title: "Failed to send reset email",
        description: error.message || "An unexpected error occurred. Please try again.",
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-sage-light/10 to-mediterranean-light/10">
      <Navigation />
      
      <main className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-md mx-auto space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold text-primary">
              {isResetMode ? "Reset Your Password" : "Request Password Reset"}
            </h1>
            <p className="text-gray-600">
              {isResetMode 
                ? "Please enter your new password below" 
                : "Enter your email address to receive a password reset link"}
            </p>
          </div>

          <div className="bg-white/60 backdrop-blur-sm p-6 md:p-8 rounded-xl border border-gray-200 shadow-sm">
            {isResetMode ? (
              <Form {...resetForm}>
                <form onSubmit={resetForm.handleSubmit(onResetSubmit)} className="space-y-4">
                  <FormField
                    control={resetForm.control}
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
                    control={resetForm.control}
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
            ) : (
              <Form {...requestForm}>
                <form onSubmit={requestForm.handleSubmit(onRequestSubmit)} className="space-y-4">
                  <FormField
                    control={requestForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input 
                            type="email" 
                            placeholder="your.email@example.com" 
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
                        Sending...
                      </>
                    ) : (
                      "Send Reset Link"
                    )}
                  </Button>
                </form>
              </Form>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
