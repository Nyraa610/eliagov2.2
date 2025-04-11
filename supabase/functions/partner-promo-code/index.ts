
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

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

    // Check if the user is a partner or admin
    const { data: profile, error: profileError } = await supabaseClient
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      return new Response(
        JSON.stringify({ error: "Unauthorized", message: "User profile not found" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (profile.role !== "admin" && profile.role !== "consultant") {
      return new Response(
        JSON.stringify({ error: "Forbidden", message: "Only partners and admins can create promo codes" }),
        {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const { action, code, discount } = await req.json();

    // Handle different actions
    if (action === "create") {
      // Generate a random code if not provided
      const promoCode = code || generatePromoCode();
      const discountPercentage = discount || 15; // Default 15% discount

      // Create the promo code in the database
      const { data: newCode, error: insertError } = await supabaseClient
        .from("promotion_codes")
        .insert({
          code: promoCode,
          discount_percentage: discountPercentage,
          is_partner_code: true,
          partner_id: user.id,
          is_active: true,
        })
        .select()
        .single();

      if (insertError) {
        return new Response(
          JSON.stringify({ error: "Failed to create promo code", message: insertError.message }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      return new Response(
        JSON.stringify({ promoCode: newCode }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    } else if (action === "list") {
      // Fetch all promo codes for this partner
      const { data: codes, error: listError } = await supabaseClient
        .from("promotion_codes")
        .select(`
          *,
          code_redemptions(count),
          partner_commissions(
            id,
            amount,
            status,
            paid_at
          )
        `)
        .eq("partner_id", user.id)
        .order("created_at", { ascending: false });

      if (listError) {
        return new Response(
          JSON.stringify({ error: "Failed to list promo codes", message: listError.message }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      // Calculate total commissions
      const enhancedCodes = codes.map(code => {
        const totalCommission = code.partner_commissions.reduce(
          (sum, commission) => sum + parseFloat(commission.amount), 
          0
        );
        
        const paidCommission = code.partner_commissions
          .filter(commission => commission.status === "paid")
          .reduce((sum, commission) => sum + parseFloat(commission.amount), 0);
          
        return {
          ...code,
          redemptions: code.code_redemptions?.[0]?.count || 0,
          totalCommission,
          paidCommission,
          pendingCommission: totalCommission - paidCommission
        };
      });

      return new Response(
        JSON.stringify({ promoCodes: enhancedCodes }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    return new Response(
      JSON.stringify({ error: "Bad Request", message: "Invalid action" }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in partner-promo-code:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});

// Helper to generate a random promo code
function generatePromoCode(length = 8) {
  const characters = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}
