
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";

export default function Assessment() {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Authentication required",
          description: "Please sign in to access the assessment.",
        });
        navigate("/register");
      }
    };

    checkAuth();
  }, [navigate, toast]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-sage-light/10 to-mediterranean-light/10">
      <Navigation />
      
      <main className="container mx-auto px-4 py-24">
        <div className="max-w-4xl mx-auto space-y-8">
          <h1 className="text-3xl font-bold text-primary">ESG Assessment</h1>
          <p className="text-gray-600">
            Start your sustainability journey by completing our comprehensive ESG assessment.
          </p>
          {/* Assessment content will go here */}
        </div>
      </main>
    </div>
  );
}
