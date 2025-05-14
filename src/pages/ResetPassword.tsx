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
};

// Password reset form schema
const resetPasswordSchema = z.object({
  password: z.string()
    .min(8, "Le mot de passe doit contenir au moins 8 caractères")
    .regex(/[A-Z]/, "Le mot de passe doit contenir au moins une lettre majuscule")
    .regex(/[a-z]/, "Le mot de passe doit contenir au moins une lettre minuscule")
    .regex(/[0-9]/, "Le mot de passe doit contenir au moins un chiffre"),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
});

export default function ResetPassword() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [accessToken, setAccessToken] = useState(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Reset form with zod resolver
  const form = useForm({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  // Parse token from URL on component mount
  useEffect(() => {
    // Check for token in URL
    const token = getAccessTokenFromUrl();
    
    if (token) {
      setAccessToken(token);
      verifyToken(token);
    } else {
      // Si pas de token, montrer un message d'erreur
      toast({
        variant: "destructive",
        title: "Lien invalide",
        description: "Le lien de réinitialisation est invalide ou a expiré.",
      });
      setIsVerifying(false);
    }
  }, []);

  // Function to extract token from URL (enhanced to check multiple formats)
  const getAccessTokenFromUrl = () => {
    // Check for token in hash fragment (#)
    if (location.hash) {
      const hashParams = new URLSearchParams(location.hash.substring(1));
      const token = hashParams.get("access_token") || hashParams.get("token");
      const type = hashParams.get("type");
      
      if (token && (!type || type === "recovery")) {
        return token;
      }
    }
    
    // Check for token in query parameters (?)
    const queryParams = new URLSearchParams(location.search);
    const token = queryParams.get("access_token") || queryParams.get("token");
    const type = queryParams.get("type");
    
    if (token && (!type || type === "recovery")) {
      return token;
    }
    
    // Check for direct token in pathname (for compatibility with some email clients)
    const pathSegments = location.pathname.split('/');
    const lastSegment = pathSegments[pathSegments.length - 1];
    if (lastSegment && lastSegment.length > 20) {
      // Likely a token if it's a long string
      return lastSegment;
    }
    
    return null;
  };

  // Function to verify token validity
  const verifyToken = async (token) => {
    try {
      // First try with getUser
      const { data: userData, error: userError } = await supabase.auth.getUser(token);
      
      if (!userError && userData?.user) {
        setIsVerifying(false);
        return;
      }
      
      // If getUser fails, try with verifyOtp
      const { data: otpData, error: otpError } = await supabase.auth.verifyOtp({
        token_hash: token,
        type: 'recovery'
      });
      
      if (!otpError && otpData) {
        setIsVerifying(false);
        return;
      }
      
      // If both methods fail, show error
      toast({
        variant: "destructive",
        title: "Lien invalide ou expiré",
        description: "Veuillez demander un nouveau lien de réinitialisation.",
      });
      navigate(ROUTES.LOGIN);
      
    } catch (error) {
      console.error("Erreur de vérification du token:", error);
      toast({
        variant: "destructive",
        title: "Erreur de vérification",
        description: "Veuillez demander un nouveau lien de réinitialisation.",
      });
      navigate(ROUTES.LOGIN);
    } finally {
      setIsVerifying(false);
    }
  };

  // Handle password reset submission
  async function onSubmit(data) {
    setIsProcessing(true);
    try {
      let result;
      
      if (accessToken) {
        // Try to use the token directly if available
        result = await supabase.auth.updateUser(
          { password: data.password },
          { accessToken }
        );
      } else {
        // Fall back to the default method
        result = await supabase.auth.updateUser({
          password: data.password,
        });
      }

      if (result.error) {
        throw result.error;
      }

      toast({
        title: "Mot de passe réinitialisé",
        description: "Votre mot de passe a été changé avec succès.",
      });

      // Redirect to login page
      setTimeout(() => navigate(ROUTES.LOGIN), 1500);
    } catch (error) {
      console.error("Erreur de réinitialisation du mot de passe:", error);
      toast({
        variant: "destructive",
        title: "Échec de la réinitialisation",
        description: error.message || "Une erreur inattendue s'est produite. Veuillez réessayer.",
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
            <p className="text-gray-600">Vérification de votre lien de réinitialisation...</p>
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
              Réinitialisation de mot de passe
            </h1>
            <p className="text-gray-600">
              Veuillez saisir votre nouveau mot de passe ci-dessous
            </p>
          </div>

          <div className="bg-white p-6 md:p-8 rounded-xl border border-gray-200 shadow-sm">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nouveau mot de passe</FormLabel>
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
                          aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                        >
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                      <FormMessage />
                      <p className="text-xs text-gray-500 mt-1">
                        Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule et un chiffre.
                      </p>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirmer le mot de passe</FormLabel>
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
                          aria-label={showConfirmPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
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
                  className="w-full bg-teal-600 hover:bg-teal-700" 
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Réinitialisation en cours...
                    </>
                  ) : (
                    "Réinitialiser le mot de passe"
                  )}
                </Button>
              </form>
            </Form>

            <div className="mt-4 text-center">
              <Button 
                variant="link" 
                onClick={() => navigate(ROUTES.LOGIN)} 
                className="text-sm text-teal-600"
              >
                Retour à la connexion
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
