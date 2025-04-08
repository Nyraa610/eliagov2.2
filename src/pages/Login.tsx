
import { Link } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LoginForm } from "@/components/auth/login/LoginForm";
import { ResetPasswordDialog } from "@/components/auth/login/ResetPasswordDialog";

export default function Login() {
  const showResetPasswordDialog = () => {
    const dialog = document.getElementById('resetPasswordDialog');
    if (dialog instanceof HTMLDialogElement) {
      dialog.showModal();
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
              <LoginForm onForgotPassword={showResetPasswordDialog} />
              
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
          
          <ResetPasswordDialog />
        </div>
      </div>
    </div>
  );
}
