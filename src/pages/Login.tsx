
import { Link } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LoginForm } from "@/components/auth/login/LoginForm";
import { ResetPasswordDialog } from "@/components/auth/login/ResetPasswordDialog";
import { TestEmailDialog } from "@/components/auth/login/TestEmailDialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function Login() {
  const [showAdminTools, setShowAdminTools] = useState(false);
  
  const showResetPasswordDialog = () => {
    const dialog = document.getElementById('resetPasswordDialog');
    if (dialog instanceof HTMLDialogElement) {
      dialog.showModal();
    }
  };

  const showTestEmailDialog = () => {
    const dialog = document.getElementById('testEmailDialog');
    if (dialog instanceof HTMLDialogElement) {
      dialog.showModal();
    }
  };

  const toggleAdminTools = () => {
    setShowAdminTools(!showAdminTools);
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
              
              {/* Hidden admin tools area, can be toggled with Ctrl+Alt+T */}
              {showAdminTools && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h3 className="text-sm font-medium text-gray-900 mb-2">Admin Tools</h3>
                  <div className="space-y-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full text-xs"
                      onClick={showTestEmailDialog}
                    >
                      Test SMTP Configuration
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Hidden button to toggle admin tools */}
          <div className="flex justify-end mt-2">
            <button 
              className="text-xs text-gray-400 hover:text-gray-500 opacity-30" 
              onClick={toggleAdminTools}
            >
              {showAdminTools ? "Hide Admin Tools" : "Show Admin Tools"}
            </button>
          </div>
          
          <ResetPasswordDialog />
          <TestEmailDialog />
        </div>
      </div>
    </div>
  );
}
