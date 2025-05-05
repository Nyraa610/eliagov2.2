import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Mail, AlertTriangle } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

export default function RegisterConfirmation() {
  const location = useLocation();
  const hasError = location.hash.includes('error');
  const isOtpExpired = location.hash.includes('otp_expired');

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
              
              <h1 className="text-3xl font-bold text-destructive">Verification Failed</h1>
              <p className="text-gray-600">
                {isOtpExpired 
                  ? "The verification link has expired. Please request a new verification email."
                  : "There was an error verifying your email. Please try again or contact support."}
              </p>
              
              <div className="flex flex-col gap-4 pt-4">
                <Link to="/register">
                  <Button className="w-full">Sign Up Again</Button>
                </Link>
                <Link to="/login">
                  <Button variant="outline" className="w-full">Try Logging In</Button>
                </Link>
              </div>
            </>
          ) : (
            <>
              <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                <Mail className="w-8 h-8 text-primary" />
              </div>
              
              <h1 className="text-3xl font-bold text-primary">email verified</h1>
              <p className="text-gray-600">
                thank you, your email has been successfuly verified.
              </p>
              
              <div className="pt-4">
                <Link to="/">
                  <Button variant="outline">Return to Home and sign in</Button>
                </Link>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
