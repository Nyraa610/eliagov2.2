
import { Navigation } from "@/components/Navigation";
import { PasswordFormFields } from "@/components/auth/reset-password/PasswordFormFields";
import { usePasswordReset } from "@/components/auth/reset-password/usePasswordReset";

const ResetPassword = () => {
  const {
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    isLoading,
    error,
    isInitialized,
    handleResetPassword,
    navigateToLogin
  } = usePasswordReset();

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-sage-light/10 to-mediterranean-light/10">
        <Navigation />
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-md mx-auto text-center">
            <div className="animate-pulse">
              <p className="text-gray-600">Verifying your reset link...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sage-light/10 to-mediterranean-light/10">
      <Navigation />
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-md mx-auto space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-primary">Reset Your Password</h1>
            <p className="text-gray-600">
              Enter a new password for your account
            </p>
          </div>

          <PasswordFormFields
            password={password}
            confirmPassword={confirmPassword}
            error={error}
            isLoading={isLoading}
            onPasswordChange={setPassword}
            onConfirmPasswordChange={setConfirmPassword}
            onSubmit={handleResetPassword}
            onCancel={navigateToLogin}
          />
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
