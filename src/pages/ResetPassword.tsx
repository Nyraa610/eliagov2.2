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
import { Loader2, Eye, EyeOff, AlertCircle } from "lucide-react";

// Constants
const ROUTES = {
  LOGIN: "/login",
  REQUEST_RESET: "/request-reset",
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
  const [sessionStatus, setSessionStatus] = useState(null);
  const [isLinkExpired, setIsLinkExpired] = useState(false);
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

  // Vérifier si le lien a expiré au chargement
  useEffect(() => {
    // Vérifier les paramètres d'URL pour les erreurs
    const queryParams = new URLSearchParams(location.search);
    const hashParams = new URLSearchParams(location.hash.substring(1));
    
    const queryError = queryParams.get("error");
    const queryErrorCode = queryParams.get("error_code");
    const hashError = hashParams.get("error");
    const hashErrorCode = hashParams.get("error_code");
    
    // Vérifier si l'une des erreurs indique que le lien a expiré
    if (
      (queryError === "access_denied" && queryErrorCode === "otp_expired") ||
      (hashError === "access_denied" && hashErrorCode === "otp_expired")
    ) {
      setIsLinkExpired(true);
      setIsVerifying(false);
      toast({
        variant: "destructive",
        title: "Lien expiré",
        description: "Votre lien de réinitialisation a expiré. Veuillez demander un nouveau lien.",
      });
      return;
    }

    // Si le lien n'a pas expiré, continuer avec la vérification de la session
    async function checkSession() {
      try {
        // Vérifier si nous avons une session active
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        console.log("Session check:", session ? "Session active" : "Pas de session active");
        setSessionStatus(session ? "active" : "inactive");
        
        if (sessionError) {
          console.error("Erreur lors de la vérification de la session:", sessionError);
        }

        // Si nous n'avons pas de session mais que nous avons un hash dans l'URL
        // c'est probablement un lien de réinitialisation valide
        if (!session && location.hash) {
          console.log("Hash détecté dans l'URL, tentative de récupération du token");
          
          // Récupérer le token du hash
          const hashParams = new URLSearchParams(location.hash.substring(1));
          const token = hashParams.get("access_token");
          const type = hashParams.get("type");
          
          console.log("Token trouvé:", token ? "Oui" : "Non");
          console.log("Type:", type);
          
          if (token && type === "recovery") {
            // Essayer d'établir une session avec le token
            const { data, error } = await supabase.auth.setSession({
              access_token: token,
              refresh_token: token, // Dans certains cas, Supabase attend aussi un refresh token
            });
            
            if (error) {
              console.error("Erreur lors de l'établissement de la session:", error);
              throw error;
            } else {
              console.log("Session établie avec succès");
              setSessionStatus("established");
            }
          }
        }
        
        // Si tout va bien, on peut continuer
        setIsVerifying(false);
        
      } catch (error) {
        console.error("Erreur lors de la vérification initiale:", error);
        toast({
          variant: "destructive",
          title: "Erreur de vérification",
          description: "Impossible de vérifier votre lien de réinitialisation. Veuillez demander un nouveau lien.",
        });
        navigate(ROUTES.REQUEST_RESET);
      }
    }
    
    checkSession();
  }, [location, navigate, toast]);

  // Handle password reset submission
  async function onSubmit(data) {
    setIsProcessing(true);
    try {
      console.log("Tentative de réinitialisation du mot de passe...");
      console.log("État de la session:", sessionStatus);
      
      // Utiliser la méthode updateUser standard
      const { data: updateData, error } = await supabase.auth.updateUser({
        password: data.password
      });
      
      console.log("Résultat de la mise à jour:", error ? "Échec" : "Succès");
      
      if (error) {
        console.error("Détails de l'erreur:", error);
        throw error;
      }
      
      console.log("Mise à jour réussie:", updateData);

      toast({
        title: "Mot de passe réinitialisé",
        description: "Votre mot de passe a été changé avec succès.",
      });

      // Redirect to login page
      setTimeout(() => navigate(ROUTES.LOGIN), 1500);
    } catch (error) {
      console.error("Erreur de réinitialisation du mot de passe:", error);
      
      // Message d'erreur plus détaillé pour aider au débogage
      toast({
        variant: "destructive",
        title: "Échec de la réinitialisation",
        description: `Erreur: ${error.message || "Erreur inconnue"}. Veuillez demander un nouveau lien de réinitialisation.`,
      });
      
      // Rediriger vers la page de demande de réinitialisation après un délai
      setTimeout(() => navigate(ROUTES.REQUEST_RESET), 3000);
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

  // Si le lien a expiré, afficher un message d'erreur et un bouton pour demander un nouveau lien
  if (isLinkExpired) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-blue-50">
        <Navigation />
        <main className="container mx-auto px-4 py-16 md:py-24">
          <div className="max-w-md mx-auto space-y-6">
            <div className="bg-white p-6 md:p-8 rounded-xl border border-red-200 shadow-sm">
              <div className="flex flex-col items-center text-center space-y-4">
                <AlertCircle className="h-12 w-12 text-red-500" />
                <h1 className="text-xl font-bold text-gray-900">Lien expiré</h1>
                <p className="text-gray-600">
                  Le lien de réinitialisation de mot de passe que vous avez utilisé a expiré ou n'est plus valide.
                </p>
                <Button 
                  onClick={() => navigate(ROUTES.REQUEST_RESET)} 
                  className="mt-4 bg-teal-600 hover:bg-teal-700"
                >
                  Demander un nouveau lien
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => navigate(ROUTES.LOGIN)} 
                  className="mt-2"
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

  // Loading state UI
  if (isVerifying) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-blue-50">
        <Navigation />
        <main className="container mx-auto px-4 py-16 md:py-24">
          <div className="max-w-md mx-auto flex flex-col items-center justify-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
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
            <h1 className="text-2xl font-bold text-teal-600">
              Réinitialisation de mot de passe
            </h1>
            <p className="text-gray-600">
              Veuillez saisir votre nouveau mot de passe ci-dessous
            </p>
            {/* Indicateur d'état de session pour le débogage - à supprimer en production */}
            {process.env.NODE_ENV === 'development' && (
              <p className="text-xs text-gray-400">
                État de session: {sessionStatus || "inconnu"}
              </p>
            )}
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
