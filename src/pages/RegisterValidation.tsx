import { Button } from "@/components/ui/button";
import { CheckCircle, AlertTriangle } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { Navigation } from "@/components/Navigation"; // Ajout de cette importation manquante

export default function RegisterValidation() {
  const location = useLocation();
  const hasError = location.hash.includes('error');

  return (
    <div className="min-h-screen bg-gradient-to-b from-sage-light/10 to-mediterranean-light/10">
      <Navigation />
      
      <main className="container mx-auto px-4 py-24">
        <div className="max-w-md mx-auto text-center space-y-6">
          {hasError ? (
            <>
              <div className="w-16 h-16 mx-auto bg-destructive/10 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-destructive" />
              </div>
              
              <h1 className="text-3xl font-bold text-destructive">Échec de validation</h1>
              <p className="text-gray-600">
                Une erreur s'est produite lors de la validation de votre email. Veuillez réessayer ou contacter notre support.
              </p>
              
              <div className="flex flex-col gap-4 pt-4">
                <Link to="/register">
                  <Button className="w-full">S'inscrire à nouveau</Button>
                </Link>
                <Link to="/login">
                  <Button variant="outline" className="w-full">Se connecter</Button>
                </Link>
              </div>
            </>
          ) : (
            <>
              <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-primary" />
              </div>
              
              <h1 className="text-3xl font-bold text-primary">Email vérifié avec succès</h1>
              <p className="text-gray-600">
                Félicitations ! Votre adresse email a été vérifiée avec succès. Vous pouvez maintenant vous connecter à votre compte.
              </p>
              
              <div className="pt-4">
                <Link to="/login">
                  <Button>Se connecter</Button>
                </Link>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
