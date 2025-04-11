
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import Stripe from "https://esm.sh/stripe@13.7.0";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
  apiVersion: "2023-10-16",
  httpClient: Stripe.createFetchHttpClient(),
});

const endpointSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET") || "";

// This function needs to be public so Stripe can call it
serve(async (req) => {
  const signature = req.headers.get("stripe-signature");
  
  if (!signature) {
    return new Response(JSON.stringify({ error: "Missing stripe-signature header" }), {
      status: 400,
    });
  }

  try {
    const body = await req.text();
    
    // Verify the webhook signature
    let event;
    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        endpointSecret
      );
    } catch (err) {
      console.error(`Webhook signature verification failed: ${err.message}`);
      return new Response(JSON.stringify({ error: "Invalid signature" }), {
        status: 400,
      });
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") || "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || ""
    );

    console.log(`Processing event: ${event.type}`);

    // Handle the event
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        
        // Check if this checkout was for a subscription
        if (session.mode === "subscription" && session.subscription) {
          const userId = session.metadata?.user_id;
          const planId = session.metadata?.plan_id;
          const partnerId = session.metadata?.partner_id;
          const promoCodeId = session.metadata?.promo_code_id;
          
          if (!userId || !planId) {
            console.error("Missing user_id or plan_id in session metadata");
            break;
          }
          
          // Get subscription details from Stripe
          const subscription = await stripe.subscriptions.retrieve(session.subscription);
          
          // Create or update user subscription in our database
          const { data: existingSubscription, error: fetchError } = await supabaseClient
            .from("user_subscriptions")
            .select("id")
            .eq("user_id", userId)
            .eq("stripe_subscription_id", session.subscription)
            .maybeSingle();
            
          if (fetchError) {
            console.error("Error fetching existing subscription:", fetchError);
          }
          
          if (existingSubscription) {
            // Update existing subscription
            await supabaseClient
              .from("user_subscriptions")
              .update({
                status: subscription.status,
                current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
                current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
                cancel_at_period_end: subscription.cancel_at_period_end,
                trial_end: subscription.trial_end 
                  ? new Date(subscription.trial_end * 1000).toISOString() 
                  : null,
                updated_at: new Date().toISOString(),
              })
              .eq("id", existingSubscription.id);
          } else {
            // Create new subscription
            const { data: newSubscription, error: insertError } = await supabaseClient
              .from("user_subscriptions")
              .insert({
                user_id: userId,
                plan_id: planId,
                status: subscription.status,
                stripe_subscription_id: subscription.id,
                stripe_customer_id: subscription.customer,
                current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
                current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
                cancel_at_period_end: subscription.cancel_at_period_end,
                trial_end: subscription.trial_end 
                  ? new Date(subscription.trial_end * 1000).toISOString() 
                  : null,
              })
              .select()
              .single();
              
            if (insertError) {
              console.error("Error inserting subscription:", insertError);
              break;
            }
            
            // If this was a partner referral, record the code redemption and commission
            if (partnerId && promoCodeId) {
              try {
                // Record code redemption
                const { data: redemption, error: redemptionError } = await supabaseClient
                  .from("code_redemptions")
                  .insert({
                    code_id: promoCodeId,
                    user_id: userId,
                    subscription_id: newSubscription.id,
                  })
                  .select()
                  .single();
                
                if (redemptionError) {
                  console.error("Error recording code redemption:", redemptionError);
                } else {
                  // Fetch the plan to calculate commission
                  const { data: plan } = await supabaseClient
                    .from("subscription_plans")
                    .select("price")
                    .eq("id", planId)
                    .single();
                    
                  if (plan) {
                    // Calculate commission (e.g., 20% of first payment)
                    const commissionRate = 0.20;
                    const commissionAmount = plan.price * commissionRate;
                    
                    // Record the commission
                    await supabaseClient
                      .from("partner_commissions")
                      .insert({
                        partner_id: partnerId,
                        code_id: promoCodeId,
                        subscription_id: newSubscription.id,
                        amount: commissionAmount,
                        status: "pending",
                      });
                  }
                }
              } catch (error) {
                console.error("Error processing partner commission:", error);
              }
            }
          }
        }
        break;
      }
      
      case "customer.subscription.updated": {
        const subscription = event.data.object;
        
        // Find the corresponding subscription in our database
        const { data: existingSubscription, error: fetchError } = await supabaseClient
          .from("user_subscriptions")
          .select("id")
          .eq("stripe_subscription_id", subscription.id)
          .maybeSingle();
          
        if (fetchError) {
          console.error("Error fetching subscription:", fetchError);
          break;
        }
        
        if (existingSubscription) {
          // Update the subscription in our database
          await supabaseClient
            .from("user_subscriptions")
            .update({
              status: subscription.status,
              current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
              current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
              cancel_at_period_end: subscription.cancel_at_period_end,
              trial_end: subscription.trial_end 
                ? new Date(subscription.trial_end * 1000).toISOString() 
                : null,
              updated_at: new Date().toISOString(),
            })
            .eq("id", existingSubscription.id);
        }
        break;
      }
      
      case "customer.subscription.deleted": {
        const subscription = event.data.object;
        
        // Update the subscription status in our database
        await supabaseClient
          .from("user_subscriptions")
          .update({
            status: "canceled",
            updated_at: new Date().toISOString(),
          })
          .eq("stripe_subscription_id", subscription.id);
        break;
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
    });
  } catch (error) {
    console.error(`Error handling webhook: ${error.message}`);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
});
