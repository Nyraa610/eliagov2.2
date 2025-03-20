
import { UserLayout } from "@/components/user/UserLayout";
import { ValueChainEditor } from "@/components/value-chain/ValueChainEditor";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { isAuthenticated } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ValueChainModeling() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [isAuth, setIsAuth] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const auth = await isAuthenticated();
        setIsAuth(auth);
        if (!auth) {
          toast({
            title: "Authentication required",
            description: "Please sign in to access this feature.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Error checking auth:", error);
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
  }, [toast]);

  if (loading) {
    return (
      <UserLayout title="Value Chain Modeling">
        <div className="space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-[600px] w-full" />
        </div>
      </UserLayout>
    );
  }

  return (
    <UserLayout title="Value Chain Modeling">
      <div className="flex items-center gap-2 mb-4">
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="gap-1"
        >
          <Link to="/assessment">
            <ChevronLeft className="h-4 w-4" />
            Back to Assessment
          </Link>
        </Button>
      </div>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Value Chain Analysis for ESG Reporting</CardTitle>
          <CardDescription>
            Visualize and analyze your company's value creation process to enhance ESG performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-muted-foreground">
            <p>
              A value chain model is crucial for ESG reporting as it helps identify environmental, social, and governance impacts across your business activities. By mapping your value chain, you can:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Identify key sustainability hotspots where environmental or social impacts are concentrated</li>
              <li>Prioritize areas for improvement to maximize ESG performance</li>
              <li>Demonstrate transparency and traceability in your sustainability reporting</li>
              <li>Facilitate stakeholder engagement by clearly illustrating how your business creates value</li>
              <li>Enable more accurate scope 1, 2, and 3 emissions calculations</li>
            </ul>
            <p>
              Use our editor below to create your value chain or leverage our AI-powered generation tool to get started quickly.
            </p>
          </div>
        </CardContent>
      </Card>

      {isAuth ? (
        <ValueChainEditor />
      ) : (
        <div className="bg-muted p-4 rounded-md text-center">
          <p>Please sign in to access the Value Chain Modeling feature.</p>
          <Button asChild className="mt-4">
            <Link to="/login">Sign In</Link>
          </Button>
        </div>
      )}
    </UserLayout>
  );
}
