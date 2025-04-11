
import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Check, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useSubscription } from "@/hooks/useSubscription";
import { useToast } from "@/components/ui/use-toast";

export default function SubscriptionSuccess() {
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const { checkSubscription, subscriptionStatus } = useSubscription();
  const { toast } = useToast();
  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    const verifySubscription = async () => {
      setIsLoading(true);
      if (sessionId) {
        try {
          // This will update our local subscription state
          await checkSubscription();
          toast({
            title: "Subscription Activated",
            description: "Your subscription has been successfully activated. Enjoy your new plan!",
            variant: "default",
          });
        } catch (error) {
          console.error("Error verifying subscription:", error);
        }
      }
      setIsLoading(false);
    };

    verifySubscription();
  }, [sessionId, checkSubscription, toast]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-sage-light/10 to-mediterranean-light/10">
      <Navigation />
      
      <main className="container mx-auto px-4 py-16">
        <Card className="max-w-2xl mx-auto">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 flex items-center justify-center rounded-full bg-green-100 mb-4">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl text-primary">Subscription Confirmed!</CardTitle>
            <CardDescription>
              Thank you for your subscription. Your account has been updated.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {isLoading ? (
              <div className="py-8 flex justify-center">
                <div className="animate-pulse flex flex-col items-center gap-4">
                  <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ) : (
              <>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium text-gray-900">Subscription Details</h3>
                  <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                    <div className="text-gray-500">Plan</div>
                    <div className="font-medium">{subscriptionStatus?.plan || "Free"}</div>
                    
                    <div className="text-gray-500">Status</div>
                    <div className="font-medium">
                      <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700">
                        Active
                      </span>
                    </div>
                    
                    {subscriptionStatus?.trialEnd && (
                      <>
                        <div className="text-gray-500">Trial Ends</div>
                        <div className="font-medium">
                          {new Date(subscriptionStatus.trialEnd).toLocaleDateString()}
                        </div>
                      </>
                    )}
                    
                    {subscriptionStatus?.currentPeriodEnd && (
                      <>
                        <div className="text-gray-500">Next Billing Date</div>
                        <div className="font-medium">
                          {new Date(subscriptionStatus.currentPeriodEnd).toLocaleDateString()}
                        </div>
                      </>
                    )}
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <Link to="/pricing">
                    <Button variant="outline">
                      Manage Subscription
                    </Button>
                  </Link>
                  <Link to="/dashboard">
                    <Button>
                      Go to Dashboard <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
