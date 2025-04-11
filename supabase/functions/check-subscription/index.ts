
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import Stripe from "https://esm.sh/stripe@13.7.0";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
  apiVersion: "2023-10-16",
  httpClient: Stripe.createFetchHttpClient(),
});

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") || "",
      Deno.env.get("SUPABASE_ANON_KEY") || "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      }
    );

    // Get the current user from the request
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser();

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized", message: userError?.message || "User not authenticated" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Fetch the user's subscription from our database
    const { data: subscription, error: subscriptionError } = await supabaseClient
      .from("user_subscriptions")
      .select("*, subscription_plans(*)")
      .eq("user_id", user.id)
      .in("status", ["active", "trialing"])
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    // If no subscription found, return that the user is on the free plan
    if (subscriptionError || !subscription) {
      return new Response(
        JSON.stringify({ 
          subscription: null,
          plan: "free",
          level: "free"
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    // If we have a subscription, verify it with Stripe
    if (subscription.stripe_subscription_id) {
      const stripeSubscription = await stripe.subscriptions.retrieve(
        subscription.stripe_subscription_id
      );

      // Update our database with the latest Stripe data
      await supabaseClient
        .from("user_subscriptions")
        .update({
          status: stripeSubscription.status,
          current_period_start: new Date(stripeSubscription.current_period_start * 1000).toISOString(),
          current_period_end: new Date(stripeSubscription.current_period_end * 1000).toISOString(),
          cancel_at_period_end: stripeSubscription.cancel_at_period_end,
          trial_end: stripeSubscription.trial_end 
            ? new Date(stripeSubscription.trial_end * 1000).toISOString() 
            : null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", subscription.id);

      // Update the subscription object with the latest status
      subscription.status = stripeSubscription.status;
      subscription.current_period_end = new Date(stripeSubscription.current_period_end * 1000).toISOString();
      subscription.trial_end = stripeSubscription.trial_end 
        ? new Date(stripeSubscription.trial_end * 1000).toISOString() 
        : null;
    }

    return new Response(
      JSON.stringify({
        subscription,
        plan: subscription.subscription_plans?.name || "free",
        level: subscription.subscription_plans?.name || "free",
        isActive: subscription.status === "active" || subscription.status === "trialing",
        willCancel: subscription.cancel_at_period_end,
        currentPeriodEnd: subscription.current_period_end,
        trialEnd: subscription.trial_end,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error in check-subscription:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
