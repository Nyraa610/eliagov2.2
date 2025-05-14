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
import { Loader2, Eye, EyeOff } from "lucide-react";

// Constants
const ROUTES = {
  LOGIN: "/login",
  RESET_PASSWORD: "/reset/password"
};

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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Reset form with zod resolver
  const resetForm = useForm({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });
  
  // Request form for password reset
  const requestForm = useForm({
    resolver: zodResolver(requestResetSchema),
    defaultValues: {
      email: "",
    },
  });

  // Parse token from URL on component mount
  useEffect(() => {
    // Check both hash and query parameters for token
    const accessToken = getAccessTokenFromUrl();
    
    if (accessToken) {
      verifyToken(accessToken);
    }
  }, [location, toast]);

  // Function to extract token from URL (checks both hash and query params)
  const getAccessTokenFromUrl = () => {
    // Check hash fragment first (traditional Supabase approach)
    if (location.hash) {
      const hashParams = new URLSearchParams(location.hash.substring(1));
      const accessToken = hashParams.get("access_token");
      const tokenType = hashParams.get("type");
      
      if (accessToken && tokenType === "recovery") {
        return accessToken;
      }
    }
    
    // Check query parameters as fallback (newer approach)
    const queryParams = new URLSearchParams(location.search);
    const accessToken = queryParams.get("access_token");
    const tokenType = queryParams.get("type");
    
    if (accessToken && tokenType === "recovery") {
      return accessToken;
    }
    
    return null;
  };

  // Function to verify token validity
  const verifyToken = (accessToken) => {
    setIsVerifying(true);
    
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
  };

  // Handle password reset submission
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
      navigate(ROUTES.LOGIN);
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
  
  // Handle password reset request submission
  async function onRequestSubmit(data) {
    setIsProcessing(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: `${window.location.origin}${ROUTES.RESET_PASSWORD}`,
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Password reset email sent",
        description: "Please check your email for the reset link.",
      });
      
      // Clear the form after successful submission
      requestForm.reset();
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

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Toggle confirm password visibility
  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  // Loading state UI
  if (isVerifying) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-blue-50">
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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-blue-50">
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

          <div className="bg-white p-6 md:p-8 rounded-xl border border-gray-200 shadow-sm">
            {isResetMode ? (
              <Form {...resetForm}>
                <form onSubmit={resetForm.handleSubmit(onResetSubmit)} className="space-y-4">
                  <FormField
                    control={resetForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>New Password</FormLabel>
                        <div className="relative">
                          <FormControl>
                            <Input 
                              type={showPassword ? "text" : "password"}
                              placeholder="••••••••" 
                              disabled={isProcessing}
                              className="pr-10"
                              {...field} 
                            />
                          </FormControl>
                          <button
                            type="button"
                            onClick={togglePasswordVisibility}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                            tabIndex={-1}
                            aria-label={showPassword ? "Hide password" : "Show password"}
                          >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                        </div>
                        <FormMessage />
                        <p className="text-xs text-gray-500 mt-1">
                          Password must be at least 8 characters and include uppercase, lowercase, and numbers.
                        </p>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={resetForm.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm New Password</FormLabel>
                        <div className="relative">
                          <FormControl>
                            <Input 
                              type={showConfirmPassword ? "text" : "password"}
                              placeholder="••••••••" 
                              disabled={isProcessing}
                              className="pr-10"
                              {...field} 
                            />
                          </FormControl>
                          <button
                            type="button"
                            onClick={toggleConfirmPasswordVisibility}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                            tabIndex={-1}
                            aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                          >
                            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                        </div>
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

            <div className="mt-4 text-center">
              <Button 
                variant="link" 
                onClick={() => navigate(ROUTES.LOGIN)} 
                className="text-sm text-primary"
              >
                Back to Login
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
