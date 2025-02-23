
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react";
import { Link } from "react-router-dom";

export default function RegisterConfirmation() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-sage-light/10 to-mediterranean-light/10">
      <Navigation />
      
      <main className="container mx-auto px-4 py-24">
        <div className="max-w-md mx-auto text-center space-y-6">
          <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
            <Mail className="w-8 h-8 text-primary" />
          </div>
          
          <h1 className="text-3xl font-bold text-primary">Check your email</h1>
          <p className="text-gray-600">
            We've sent you a confirmation email. Please click the link in the email to verify your account.
          </p>
          
          <div className="pt-4">
            <Link to="/">
              <Button variant="outline">Return to Home</Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
