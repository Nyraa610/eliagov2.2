import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { Label } from "@/components/ui/label";
import { emailService } from "@/services/emailService";

const formSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export default function Login() {
  const [isLoading, setIsLoading] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const { signIn } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    try {
      console.log("Login attempt for:", values.email);
      
      const { error } = await signIn(values.email, values.password);
      
      if (error) {
        console.error("Login error:", error);
        toast({
          variant: "destructive",
          title: "Login failed",
          description: error.message || "Invalid email or password",
        });
      } else {
        toast({
          title: "Login successful",
          description: "Welcome back!",
        });
        
        navigate("/");
      }
    } catch (error: any) {
      console.error("Login exception:", error);
      toast({
        variant: "destructive",
        title: "Login failed",
        description: error.message || "An unexpected error occurred",
      });
    } finally {
      setIsLoading(false);
    }
  };

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
      
      // Call Supabase to send the reset email
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: resetLink,
      });
      
      if (error) {
        console.error("Supabase password reset error:", error);
        throw error;
      }
      
      // Send a custom email using our email service for better deliverability
      try {
        const { success, error: emailError } = await emailService.sendPasswordResetEmail(resetEmail, resetLink);
        if (!success && emailError) {
          console.warn("Custom password reset email failed, but Supabase email was sent:", emailError);
        }
      } catch (emailError) {
        console.error("Exception sending custom reset email:", emailError);
        // Don't block the process if the custom email fails
        // Supabase's built-in reset email should still work
      }
      
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
        description: error.message || "An unexpected error occurred",
      });
    } finally {
      setIsResettingPassword(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sage-light/10 to-mediterranean-light/10">
      <Navigation />
      
      <div className="container mx-auto px-4 py-16 lg:py-24">
        <div className="max-w-md mx-auto">
          <Card className="bg-white/60 backdrop-blur-sm border-gray-200 shadow-sm">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold text-center">Sign in</CardTitle>
              <CardDescription className="text-center">
                Enter your email and password to access your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="your@email.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input type="password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex justify-end">
                    <Button 
                      type="button" 
                      variant="link" 
                      className="p-0 h-auto text-sm text-primary"
                      onClick={() => {
                        const dialog = document.getElementById('resetPasswordDialog');
                        if (dialog instanceof HTMLDialogElement) {
                          dialog.showModal();
                        }
                      }}
                    >
                      Forgot password?
                    </Button>
                  </div>
                  
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Signing in..." : "Sign in"}
                  </Button>
                </form>
              </Form>
              
              <div className="mt-4 text-center">
                <p className="text-sm text-gray-600">
                  Don't have an account?{" "}
                  <Link to="/register" className="text-primary font-medium hover:underline">
                    Sign up
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
          
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
        </div>
      </div>
    </div>
  );
}
