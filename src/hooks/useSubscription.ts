
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";

export type SubscriptionPlan = {
  id: string;
  name: string;
  description: string | null;
  features: string[];
  price: number;
  trial_days: number;
  billing_interval: string;
};

export type SubscriptionStatus = {
  subscription: any | null;
  plan: string;
  level: string;
  isActive: boolean;
  willCancel?: boolean;
  currentPeriodEnd?: string;
  trialEnd?: string;
};

export function useSubscription() {
  const [isLoading, setIsLoading] = useState(true);
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();

  // Fetch all available subscription plans
  const fetchPlans = async () => {
    try {
      const { data, error } = await supabase
        .from("subscription_plans")
        .select("*")
        .eq("is_active", true)
        .order("price");

      if (error) {
        console.error("Error fetching subscription plans:", error);
        return;
      }

      // Process plans to ensure features is always a string array
      const processedPlans = data.map(plan => ({
        ...plan,
        // Convert features from Json to string[] or use empty array if null/undefined
        features: Array.isArray(plan.features) 
          ? plan.features.map(feature => String(feature)) 
          : []
      }));

      setPlans(processedPlans);
    } catch (error) {
      console.error("Error processing subscription plans:", error);
    }
  };

  // Check the user's current subscription status
  const checkSubscription = async () => {
    if (!isAuthenticated) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("check-subscription");
      
      if (error) {
        console.error("Error checking subscription:", error);
        toast({
          title: "Subscription Error",
          description: "Could not verify your subscription status. Please try again later.",
          variant: "destructive"
        });
        setIsLoading(false);
        return;
      }
      
      setSubscriptionStatus(data);
    } catch (error) {
      console.error("Error processing subscription status:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Create a Stripe checkout session for a selected plan
  const createCheckoutSession = async (planId: string, promoCode?: string, yearly = false) => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please log in to subscribe to a plan.",
        variant: "destructive"
      });
      return null;
    }

    try {
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { planId, promoCode, yearly }
      });
      
      if (error) {
        console.error("Error creating checkout session:", error);
        toast({
          title: "Checkout Error",
          description: "Could not initiate checkout. Please try again later.",
          variant: "destructive"
        });
        return null;
      }
      
      return data?.url || null;
    } catch (error) {
      console.error("Error in checkout process:", error);
      toast({
        title: "System Error",
        description: "An unexpected error occurred. Please try again later.",
        variant: "destructive"
      });
      return null;
    }
  };

  // Check if user can access a specific feature based on subscription
  const canAccessFeature = async (featureName: string) => {
    try {
      const { data, error } = await supabase.rpc("can_access_feature", {
        feature_name: featureName
      });
      
      if (error) {
        console.error("Error checking feature access:", error);
        return false;
      }
      
      return data;
    } catch (error) {
      console.error("Error in feature access check:", error);
      return false;
    }
  };

  // Initial data load
  useEffect(() => {
    fetchPlans();
  }, []);

  // Check subscription whenever auth state changes
  useEffect(() => {
    if (!authLoading) {
      checkSubscription();
    }
  }, [isAuthenticated, authLoading]);

  return {
    isLoading,
    subscriptionStatus,
    plans,
    checkSubscription,
    createCheckoutSession,
    canAccessFeature
  };
}
