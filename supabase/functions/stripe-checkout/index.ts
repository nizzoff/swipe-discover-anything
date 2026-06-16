import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface CheckoutRequest {
  priceId?: string;
  planType: "monthly" | "annual" | "lifetime";
  promoCode?: string;
  successUrl?: string;
  cancelUrl?: string;
}

// Stripe price IDs - these will be configured via environment variables
const STRIPE_PRICES = {
  monthly: Deno.env.get("STRIPE_PRICE_MONTHLY"),
  annual: Deno.env.get("STRIPE_PRICE_ANNUAL"),
  lifetime: Deno.env.get("STRIPE_PRICE_LIFETIME"),
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Get auth token from header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body: CheckoutRequest = await req.json();
    const { planType, promoCode, successUrl, cancelUrl } = body;

    const priceId = STRIPE_PRICES[planType];
    if (!priceId) {
      return new Response(JSON.stringify({ error: "Invalid plan type" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Validate promo code if provided
    let promoCodeData: { id: string; discount_percent: number; discount_amount_cents: number } | null = null;
    let stripeCouponId: string | null = null;

    if (promoCode) {
      const { data: promo, error: promoError } = await supabase
        .from("promo_codes")
        .select("id, discount_percent, discount_amount_cents, plan_type, max_uses, uses_count, expires_at, is_active")
        .eq("code", promoCode.toUpperCase())
        .single();

      if (promo && !promoError) {
        // Check if promo code is valid
        const isValid = promo.is_active &&
          (promo.max_uses === null || promo.uses_count < promo.max_uses) &&
          (promo.expires_at === null || new Date(promo.expires_at) > new Date()) &&
          (promo.plan_type === null || promo.plan_type === planType);

        if (isValid) {
          promoCodeData = promo;

          // Create or get Stripe coupon
          if (promo.discount_percent) {
            // Create a coupon for this checkout
            const couponRes = await fetch("https://api.stripe.com/v1/coupons", {
              method: "POST",
              headers: {
                "Authorization": `Bearer ${Deno.env.get("STRIPE_SECRET_KEY")}`,
                "Content-Type": "application/x-www-form-urlencoded",
              },
              body: new URLSearchParams({
                "percent_off": promo.discount_percent.toString(),
                "duration": "once",
                "metadata[promo_code_id]": promo.id,
              }),
            });

            if (couponRes.ok) {
              const coupon = await couponRes.json();
              stripeCouponId = coupon.id;
            }
          }
        }
      }
    }

    // Get or create subscription record
    const { data: existingSub } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", user.id)
      .single();

    let customerId = existingSub?.stripe_customer_id;

    // Create Stripe customer if needed
    if (!customerId) {
      const customerRes = await fetch("https://api.stripe.com/v1/customers", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${Deno.env.get("STRIPE_SECRET_KEY")}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          email: user.email ?? "",
          metadata: JSON.stringify({ user_id: user.id }),
        }),
      });

      const customer = await customerRes.json();
      if (!customerRes.ok) {
        throw new Error(customer.error?.message || "Failed to create customer");
      }
      customerId = customer.id;

      // Store customer ID
      if (existingSub) {
        await supabase
          .from("subscriptions")
          .update({ stripe_customer_id: customerId })
          .eq("user_id", user.id);
      }
    }

    // Create checkout session
    const origin = new URL(req.url).origin;
    const sessionParams = new URLSearchParams({
      customer: customerId,
      mode: planType === "lifetime" ? "payment" : "subscription",
      "line_items[0][price]": priceId,
      "line_items[0][quantity]": "1",
      success_url: successUrl || `${origin}/premium?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${origin}/premium?canceled=true`,
      metadata: JSON.stringify({
        user_id: user.id,
        plan_type: planType,
        promo_code_id: promoCodeData?.id || null,
      }),
    });

    // Add trial for first-time subscribers (14 days)
    if (planType !== "lifetime" && !existingSub?.trial_ends_at) {
      sessionParams.set("subscription_data[trial_period_days]", "14");
    }

    // Apply coupon if valid
    if (stripeCouponId) {
      if (planType === "lifetime") {
        sessionParams.set("discounts[0][coupon]", stripeCouponId);
      } else {
        sessionParams.set("subscription_data[coupon]", stripeCouponId);
      }
    }

    const sessionRes = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${Deno.env.get("STRIPE_SECRET_KEY")}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: sessionParams,
    });

    const session = await sessionRes.json();
    if (!sessionRes.ok) {
      throw new Error(session.error?.message || "Failed to create checkout session");
    }

    // Create/update subscription record
    const trialEnd = new Date();
    trialEnd.setDate(trialEnd.getDate() + 14);

    await supabase.from("subscriptions").upsert({
      user_id: user.id,
      stripe_customer_id: customerId,
      status: "trialing",
      plan_type: planType,
      trial_ends_at: trialEnd.toISOString(),
    }, { onConflict: "user_id" });

    // Increment promo code usage if used
    if (promoCodeData) {
      await supabase
        .from("promo_codes")
        .update({ uses_count: (existingSub?.uses_count || 0) + 1 })
        .eq("id", promoCodeData.id);
    }

    return new Response(JSON.stringify({
      url: session.url,
      promoApplied: !!promoCodeData,
      discount: promoCodeData?.discount_percent || promoCodeData?.discount_amount_cents,
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Checkout error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Internal error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
