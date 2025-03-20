
import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/contexts/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { t } = useTranslation();
  const { isAuthenticated, isLoading: authLoading, signIn } = useAuth();

  // Get the redirect path from location state or default to dashboard
  const from = location.state?.from?.pathname || "/dashboard";

  // Check if user is already logged in
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      console.log("User already logged in, redirecting to dashboard");
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, authLoading, navigate]);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setLoginError(null);
    
    try {
      const { error } = await signIn(email, password);
      
      if (error) {
        setLoginError(error.message || "An unknown error occurred during login");
        return;
      }
      
      toast({
        title: "Login successful",
        description: "Welcome back!",
      });
      
      // Navigate to the protected route the user was trying to access, or dashboard
      navigate(from, { replace: true });
    } catch (error: any) {
      console.error("Login error:", error);
      setLoginError(error.message || "An unknown error occurred during login");
    } finally {
      setIsLoading(false);
    }
  };
  
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-sage-light/10 to-mediterranean-light/10 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-sage-light/10 to-mediterranean-light/10">
      <Navigation />
      
      <main className="container mx-auto px-4 py-24">
        <div className="max-w-md mx-auto">
          <Card className="border-sage">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-center text-primary">{t('auth.login')}</CardTitle>
              <CardDescription className="text-center">
                {t('auth.signIn')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">{t('auth.email')}</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="example@company.com" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">{t('auth.password')}</Label>
                    <Link to="/reset-password" className="text-xs text-primary hover:underline">
                      {t('auth.forgotPassword')}
                    </Link>
                  </div>
                  <Input 
                    id="password" 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                
                {loginError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">
                    {loginError}
                  </div>
                )}
                
                <Button className="w-full" type="submit" disabled={isLoading}>
                  {isLoading ? "Logging in..." : t('auth.login')}
                </Button>
              </form>
              
              <div className="mt-6 text-center text-sm">
                <p className="text-muted-foreground">
                  {t('auth.noAccount')}{" "}
                  <Link to="/register" className="text-primary hover:underline">
                    {t('auth.signUp')}
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
