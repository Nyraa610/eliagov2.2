
import { ReactNode, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock } from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

interface FeatureAccessProps {
  featureName: string;
  fallback?: ReactNode;
  children: ReactNode;
}

export function FeatureAccess({ featureName, fallback, children }: FeatureAccessProps) {
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { canAccessFeature } = useSubscription();
  const navigate = useNavigate();

  useEffect(() => {
    const checkAccess = async () => {
      setIsLoading(true);
      try {
        const access = await canAccessFeature(featureName);
        setHasAccess(access);
      } catch (error) {
        console.error(`Error checking access to feature ${featureName}:`, error);
        setHasAccess(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAccess();
  }, [featureName, canAccessFeature]);

  if (isLoading) {
    return (
      <div className="animate-pulse flex flex-col space-y-4 p-8">
        <div className="h-8 bg-gray-200 rounded w-1/3"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        <div className="h-24 bg-gray-200 rounded w-full"></div>
      </div>
    );
  }

  if (hasAccess) {
    return <>{children}</>;
  }

  // Default fallback if none provided
  if (!fallback) {
    return (
      <Card className="border-dashed border-gray-300">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-gray-400" />
            This feature requires a subscription
          </CardTitle>
          <CardDescription>
            Upgrade your plan to access this feature and more
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">
            The {featureName} feature is available in our paid plans. Upgrade to unlock advanced ESG functionality.
          </p>
        </CardContent>
        <CardFooter>
          <Button onClick={() => navigate("/pricing")}>
            View Pricing Plans
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return <>{fallback}</>;
}
