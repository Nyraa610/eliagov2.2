
import { Navigation } from "@/components/Navigation";
import { RegisterForm } from "@/components/auth/register/RegisterForm";

export default function Register() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-sage-light/10 to-mediterranean-light/10">
      <Navigation />
      
      <main className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-lg mx-auto space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-primary">Create your account</h1>
            <p className="text-gray-600">
              Join ELIA GO to start your sustainability journey
            </p>
          </div>

          <div className="bg-white/60 backdrop-blur-sm p-6 md:p-8 rounded-xl border border-gray-200 shadow-sm">
            <RegisterForm />
          </div>
        </div>
      </main>
    </div>
  );
}
