import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
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
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const body = await req.json();
    const { code, planType } = body;

    if (!code) {
      return new Response(JSON.stringify({ valid: false, error: "Code requis" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: promo, error } = await supabase
      .from("promo_codes")
      .select("id, code, discount_percent, discount_amount_cents, plan_type, max_uses, uses_count, expires_at, is_active")
      .eq("code", code.toUpperCase())
      .single();

    if (error || !promo) {
      return new Response(JSON.stringify({
        valid: false,
        error: "Code promo invalide",
      }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Validate promo code conditions
    if (!promo.is_active) {
      return new Response(JSON.stringify({
        valid: false,
        error: "Ce code promo n'est plus actif",
      }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (promo.expires_at && new Date(promo.expires_at) < new Date()) {
      return new Response(JSON.stringify({
        valid: false,
        error: "Ce code promo a expiré",
      }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (promo.max_uses !== null && promo.uses_count >= promo.max_uses) {
      return new Response(JSON.stringify({
        valid: false,
        error: "Ce code promo a atteint sa limite d'utilisation",
      }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (planType && promo.plan_type && promo.plan_type !== planType) {
      return new Response(JSON.stringify({
        valid: false,
        error: `Ce code promo n'est valide que pour le plan ${promo.plan_type === "monthly" ? "mensuel" : promo.plan_type === "annual" ? "annuel" : "à vie"}`,
      }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({
      valid: true,
      discount: promo.discount_percent || promo.discount_amount_cents,
      discountType: promo.discount_percent ? "percent" : "amount",
      message: promo.discount_percent
        ? `${promo.discount_percent}% de réduction`
        : `${(promo.discount_amount_cents / 100).toFixed(2)} € de réduction`,
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Validate promo error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Internal error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
