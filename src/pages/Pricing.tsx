
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useSubscription } from "@/hooks/useSubscription";
import { useAuth } from "@/contexts/AuthContext";
import { Navigation } from "@/components/Navigation";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";

export default function Pricing() {
  const [isAnnual, setIsAnnual] = useState(true);
  const [promoCode, setPromoCode] = useState("");
  const [isLoading, setIsLoading] = useState<Record<string, boolean>>({});
  const { isAuthenticated } = useAuth();
  const { subscriptionStatus, plans, createCheckoutSession } = useSubscription();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubscribe = async (planId: string) => {
    if (!isAuthenticated) {
      navigate("/login", { state: { from: "/pricing" } });
      return;
    }

    setIsLoading(prev => ({ ...prev, [planId]: true }));

    try {
      const checkoutUrl = await createCheckoutSession(planId, promoCode || undefined, isAnnual);
      if (checkoutUrl) {
        window.location.href = checkoutUrl;
      }
    } finally {
      setIsLoading(prev => ({ ...prev, [planId]: false }));
    }
  };

  const formatPrice = (price: number) => {
    if (isAnnual) {
      // Show both monthly price with annual discount and total
      return (
        <div className="flex flex-col">
          <span className="text-sm text-muted-foreground line-through">${price}/mo</span>
          <span className="text-3xl font-bold">${(price * 0.9).toFixed(2)}/mo</span>
          <span className="text-sm text-muted-foreground">billed annually</span>
        </div>
      );
    }
    return (
      <div className="flex flex-col">
        <span className="text-3xl font-bold">${price}/mo</span>
        <span className="text-sm text-muted-foreground">billed monthly</span>
      </div>
    );
  };

  const isCurrentPlan = (planName: string) => {
    return subscriptionStatus?.plan === planName && subscriptionStatus?.isActive;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sage-light/10 to-mediterranean-light/10">
      <Navigation />
      
      <main className="container mx-auto px-4 py-16">
        <div className="text-center space-y-4 mb-12">
          <h1 className="text-4xl font-bold text-primary">Plans & Pricing</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Choose the perfect plan for your ESG journey. All plans include a 7-day free trial.
          </p>
          
          <div className="flex items-center justify-center gap-2 mt-8">
            <span className={`text-sm ${!isAnnual ? 'font-semibold text-primary' : 'text-gray-600'}`}>
              Monthly
            </span>
            <Switch
              checked={isAnnual}
              onCheckedChange={setIsAnnual}
            />
            <span className={`text-sm ${isAnnual ? 'font-semibold text-primary' : 'text-gray-600'}`}>
              Annual <span className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded">Save 10%</span>
            </span>
          </div>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <Card 
              key={plan.id}
              className={`${
                plan.name === 'SustainOps' 
                  ? 'border-primary shadow-lg shadow-primary/10' 
                  : 'border-gray-200'
              }`}
            >
              <CardHeader>
                <CardTitle>{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                {formatPrice(plan.price)}
                {plan.trial_days > 0 && (
                  <span className="inline-block mt-2 text-sm bg-blue-50 text-blue-600 px-2 py-1 rounded">
                    Includes {plan.trial_days}-day free trial
                  </span>
                )}
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                {plan.price === 0 ? (
                  <Button className="w-full" variant={isCurrentPlan(plan.name) ? "outline" : "default"}>
                    {isCurrentPlan(plan.name) ? "Current Plan" : "Free Access"}
                  </Button>
                ) : (
                  <Button 
                    className="w-full"
                    variant={isCurrentPlan(plan.name) ? "outline" : "default"}
                    disabled={isCurrentPlan(plan.name) || isLoading[plan.id]}
                    onClick={() => handleSubscribe(plan.id)}
                  >
                    {isLoading[plan.id] ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing
                      </span>
                    ) : isCurrentPlan(plan.name) ? (
                      "Current Plan"
                    ) : (
                      <>Subscribe <ChevronRight className="h-4 w-4 ml-1" /></>
                    )}
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
        
        <div className="mt-12 flex flex-col items-center">
          <div className="max-w-md w-full">
            <h3 className="text-lg font-semibold mb-2">Have a promotion code?</h3>
            <div className="flex gap-2">
              <Input
                placeholder="Enter code"
                value={promoCode}
                onChange={e => setPromoCode(e.target.value.toUpperCase())}
                className="flex-1"
              />
              {promoCode && (
                <Button 
                  variant="outline"
                  onClick={() => {
                    toast({
                      title: "Promotion Code Added",
                      description: `The code "${promoCode}" will be applied at checkout.`,
                    });
                  }}
                >
                  Apply
                </Button>
              )}
            </div>
          </div>
        </div>
        
        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold text-primary mb-4">Need a custom enterprise plan?</h2>
          <p className="text-gray-600 max-w-2xl mx-auto mb-6">
            For organizations with specialized needs, we offer custom enterprise plans with dedicated support and advanced features.
          </p>
          <Button size="lg" variant="outline">
            Contact Us
          </Button>
        </div>
      </main>
    </div>
  );
}
