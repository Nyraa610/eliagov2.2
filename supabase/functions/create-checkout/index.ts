
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

    // Parse the request payload
    const { planId, promoCode, yearly } = await req.json();
    
    // Fetch the plan details from the database
    const { data: plan, error: planError } = await supabaseClient
      .from("subscription_plans")
      .select("*")
      .eq("id", planId)
      .single();

    if (planError || !plan) {
      return new Response(
        JSON.stringify({ error: "Bad Request", message: "Invalid plan" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Check if user already has an active subscription
    const { data: existingSubscription } = await supabaseClient
      .from("user_subscriptions")
      .select("*")
      .eq("user_id", user.id)
      .in("status", ["active", "trialing"])
      .maybeSingle();

    // Check if user already has a customer ID in Stripe
    let customerId;
    const { data: profile } = await supabaseClient
      .from("profiles")
      .select("email, full_name")
      .eq("id", user.id)
      .single();

    // Lookup customer or create a new one
    const customerEmail = profile?.email || user.email;
    const customers = await stripe.customers.list({
      email: customerEmail,
      limit: 1,
    });

    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    } else {
      const newCustomer = await stripe.customers.create({
        email: customerEmail,
        name: profile?.full_name || undefined,
        metadata: {
          user_id: user.id,
        },
      });
      customerId = newCustomer.id;
    }

    // Set up the line items for checkout
    let stripePriceId = plan.stripe_price_id;
    
    // If we don't have a stored price ID, create a product and price in Stripe
    if (!stripePriceId) {
      // Convert to yearly if requested
      const interval = yearly ? "year" : "month";
      const priceAmount = yearly 
        ? Math.round(plan.price * 12 * 100) // Yearly price in cents
        : Math.round(plan.price * 100); // Monthly price in cents
      
      const priceData = {
        currency: "usd",
        product_data: {
          name: plan.name + (yearly ? " (Annual)" : " (Monthly)"),
          description: plan.description || undefined,
        },
        unit_amount: priceAmount,
        recurring: {
          interval: interval,
        },
      };

      const price = await stripe.prices.create(priceData);
      stripePriceId = price.id;
      
      // Update the plan in the database with the new price ID
      await supabaseClient
        .from("subscription_plans")
        .update({ stripe_price_id: stripePriceId })
        .eq("id", planId);
    }

    // Create the checkout session
    const checkoutSessionParams = {
      customer: customerId,
      payment_method_types: ["card"],
      line_items: [
        {
          price: stripePriceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${req.headers.get("origin")}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get("origin")}/pricing`,
      subscription_data: {
        trial_period_days: plan.trial_days > 0 ? plan.trial_days : undefined,
        metadata: {
          user_id: user.id,
          plan_id: planId,
        },
      },
      metadata: {
        user_id: user.id,
        plan_id: planId,
      },
    };

    // Apply promotion code if provided
    if (promoCode) {
      // Verify the promo code exists in our database
      const { data: promoData } = await supabaseClient
        .from("promotion_codes")
        .select("*")
        .eq("code", promoCode)
        .eq("is_active", true)
        .single();

      if (promoData) {
        // Find or create the promo code in Stripe
        let stripePromoId = promoData.stripe_promotion_id;
        
        if (!stripePromoId) {
          // Create the promo code in Stripe
          let couponId;
          // Create or retrieve the coupon in Stripe
          const coupon = await stripe.coupons.create({
            percent_off: promoData.discount_percentage || undefined,
            amount_off: promoData.discount_amount ? Math.round(promoData.discount_amount * 100) : undefined,
            currency: promoData.discount_amount ? "usd" : undefined,
            duration: "once",
            max_redemptions: promoData.max_redemptions || undefined,
          });
          couponId = coupon.id;
          
          // Create the promotion code linked to the coupon
          const promoCodeResponse = await stripe.promotionCodes.create({
            coupon: couponId,
            code: promoData.code,
            max_redemptions: promoData.max_redemptions,
            expires_at: promoData.expires_at ? Math.floor(new Date(promoData.expires_at).getTime() / 1000) : undefined,
          });
          
          stripePromoId = promoCodeResponse.id;
          
          // Update our database with the Stripe promo code ID
          await supabaseClient
            .from("promotion_codes")
            .update({ stripe_promotion_id: stripePromoId })
            .eq("id", promoData.id);
        }
        
        // Add the promotion code to the checkout session
        checkoutSessionParams.discounts = [
          {
            promotion_code: stripePromoId,
          },
        ];
        
        // Check if it's a partner code, to track referrals
        if (promoData.is_partner_code && promoData.partner_id) {
          checkoutSessionParams.metadata.partner_id = promoData.partner_id;
          checkoutSessionParams.metadata.promo_code_id = promoData.id;
        }
      }
    }

    const session = await stripe.checkout.sessions.create(checkoutSessionParams);

    return new Response(
      JSON.stringify({ 
        sessionId: session.id, 
        url: session.url 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error in create-checkout:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
