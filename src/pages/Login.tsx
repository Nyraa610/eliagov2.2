
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";
import { LogIn, AlertCircle } from "lucide-react";
import { Navigation } from "@/components/Navigation";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isResetMode, setIsResetMode] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  // Check if user is already logged in
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const from = (location.state as any)?.from?.pathname || "/";
        navigate(from, { replace: true });
      }
    };
    
    checkUser();
  }, [navigate, location]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast({
          variant: "destructive",
          title: "Login failed",
          description: error.message,
        });
      } else {
        toast({
          title: "Login successful",
          description: "Welcome back!",
        });
        
        // Redirect to the page they tried to visit or home
        const from = (location.state as any)?.from?.pathname || "/";
        navigate(from, { replace: true });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Login failed",
        description: "An unexpected error occurred",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Get the current URL origin
      const origin = window.location.origin;
      
      // The redirectTo should be the reset-password page
      const redirectTo = `${origin}/reset-password`;
      
      console.log("Sending reset password email with redirect to:", redirectTo);
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo,
      });

      if (error) {
        throw error;
      }
      
      setResetSent(true);
      toast({
        title: "Password reset email sent",
        description: "Check your email for a password reset link",
      });
    } catch (error: any) {
      console.error("Reset password error:", error);
      toast({
        variant: "destructive",
        title: "Password reset failed",
        description: error.message || "An unexpected error occurred",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sage-light/10 to-mediterranean-light/10">
      <Navigation />
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-md mx-auto space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-primary">
              {isResetMode ? "Reset Password" : "Welcome Back"}
            </h1>
            <p className="text-gray-600">
              {isResetMode
                ? "Enter your email to receive a password reset link"
                : "Sign in to your account to continue"}
            </p>
          </div>

          {resetSent ? (
            <div className="bg-white p-6 rounded-lg shadow-md text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-xl font-semibold">Check Your Email</h2>
              <p className="text-gray-600">
                We've sent a password reset link to your email address.
              </p>
              <Button 
                className="w-full mt-4" 
                onClick={() => {
                  setIsResetMode(false);
                  setResetSent(false);
                }}
              >
                Back to Login
              </Button>
            </div>
          ) : (
            <form 
              onSubmit={isResetMode ? handleResetPassword : handleLogin} 
              className="space-y-4 bg-white p-6 rounded-lg shadow-md"
            >
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              
              {!isResetMode && (
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              )}
              
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  isResetMode ? "Sending..." : "Signing in..."
                ) : (
                  <>
                    <LogIn className="w-4 h-4 mr-2" />
                    {isResetMode ? "Send Reset Link" : "Sign In"}
                  </>
                )}
              </Button>
              
              <div className="flex flex-col space-y-2 pt-2 text-center">
                <Button
                  variant="link"
                  type="button"
                  className="p-0 h-auto text-sm text-gray-600"
                  onClick={() => setIsResetMode(!isResetMode)}
                >
                  {isResetMode ? "Back to Login" : "Forgot your password?"}
                </Button>
                
                <p className="text-sm text-gray-600">
                  Don't have an account?{" "}
                  <Button
                    variant="link"
                    className="p-0 h-auto font-semibold text-primary"
                    onClick={() => navigate("/register")}
                  >
                    Register here
                  </Button>
                </p>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
