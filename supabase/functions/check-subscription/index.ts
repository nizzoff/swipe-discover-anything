import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  if (req.method !== "GET" && req.method !== "POST") {
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

    let subscription: {
      plan_type?: string;
      status?: string;
      trial_ends_at?: string | null;
      current_period_end?: string | null;
      cancel_at_period_end?: boolean | null;
    } | null = null;
    {
      const { data, error } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      // Table may not exist yet (PGRST205) — treat as "no subscription"
      if (error && error.code !== "PGRST116" && error.code !== "PGRST205") {
        throw error;
      }
      subscription = data ?? null;
    }

    const now = new Date();
    let hasAccess = false;
    let accessReason = "no_subscription";

    if (subscription) {
      const isActive = subscription.status === "active";
      const isTrialing = subscription.status === "trialing" && subscription.trial_ends_at
        ? new Date(subscription.trial_ends_at) > now
        : false;
      const isLifetime = subscription.plan_type === "lifetime" && subscription.status === "active";
      const isPastDue = subscription.status === "past_due";
      const isCanceled = subscription.status === "canceled";

      if (isLifetime) {
        hasAccess = true;
        accessReason = "lifetime";
      } else if (isActive) {
        hasAccess = true;
        accessReason = "active_subscription";
      } else if (isTrialing) {
        hasAccess = true;
        accessReason = "trial";
      } else if (isPastDue) {
        hasAccess = false;
        accessReason = "payment_failed";
      } else if (isCanceled) {
        hasAccess = false;
        accessReason = "canceled";
      }
    }

    // Also check active promo-code redemption
    if (!hasAccess) {
      const { data: promo } = await supabase.rpc("user_active_promo", { _user_id: user.id });
      const row = Array.isArray(promo) ? promo[0] : null;
      if (row) {
        hasAccess = true;
        accessReason = "promo";
      }
    }

    return new Response(JSON.stringify({
      hasAccess,
      accessReason,
      subscription: subscription ? {
        planType: subscription.plan_type,
        status: subscription.status,
        trialEndsAt: subscription.trial_ends_at,
        currentPeriodEnd: subscription.current_period_end,
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
      } : null,
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Check subscription error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Internal error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
