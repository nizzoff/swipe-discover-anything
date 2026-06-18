import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

// ---------- helpers ----------

function generateCode(length = 10): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/O/1/I
  let out = "";
  const arr = new Uint32Array(length);
  crypto.getRandomValues(arr);
  for (let i = 0; i < length; i++) out += alphabet[arr[i] % alphabet.length];
  return out;
}

async function assertAdmin(userId: string): Promise<void> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin
    .from("user_roles")
    .select("id")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Accès refusé : administrateurs uniquement");
}

// ---------- user-facing ----------

export const isAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data } = await supabaseAdmin
      .from("user_roles")
      .select("id")
      .eq("user_id", context.userId)
      .eq("role", "admin")
      .maybeSingle();
    return { isAdmin: Boolean(data) };
  });

export const getMyAccess = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin.rpc("user_active_promo", {
      _user_id: context.userId,
    });
    if (error) throw new Error(error.message);
    const row = Array.isArray(data) ? data[0] : null;
    if (!row) return { hasAccess: false as const };
    return {
      hasAccess: true as const,
      tier: row.tier as "premium" | "premium_plus" | "beta",
      expiresAt: row.expires_at as string | null,
    };
  });

export const redeemPromoCode = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ code: z.string().trim().min(3).max(64) }).parse(d))
  .handler(async ({ data, context }) => {
    const code = data.code.toUpperCase();
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: promo, error } = await supabaseAdmin
      .from("promo_codes")
      .select("*")
      .eq("code", code)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!promo) throw new Error("Code invalide");
    if (!promo.is_active) throw new Error("Ce code n'est plus actif");
    if (promo.expires_at && new Date(promo.expires_at) < new Date())
      throw new Error("Ce code a expiré");
    if (promo.max_uses !== null && promo.uses_count >= promo.max_uses)
      throw new Error("Ce code a atteint sa limite d'utilisation");

    // already redeemed?
    const { data: existing } = await supabaseAdmin
      .from("promo_redemptions")
      .select("id")
      .eq("promo_code_id", promo.id)
      .eq("user_id", context.userId)
      .maybeSingle();
    if (existing) throw new Error("Vous avez déjà utilisé ce code");

    // atomic increment guarded by max_uses
    const { data: incremented, error: incErr } = await supabaseAdmin
      .from("promo_codes")
      .update({ uses_count: promo.uses_count + 1 })
      .eq("id", promo.id)
      .eq("uses_count", promo.uses_count)
      .select("id")
      .maybeSingle();
    if (incErr) throw new Error(incErr.message);
    if (!incremented) throw new Error("Code temporairement indisponible, réessayez");

    const redemptionExpiresAt = promo.duration_days
      ? new Date(Date.now() + promo.duration_days * 86400_000).toISOString()
      : null;

    const { error: insErr } = await supabaseAdmin.from("promo_redemptions").insert({
      promo_code_id: promo.id,
      user_id: context.userId,
      access_tier: promo.access_tier,
      expires_at: redemptionExpiresAt,
    });
    if (insErr) {
      // rollback usage count
      await supabaseAdmin
        .from("promo_codes")
        .update({ uses_count: promo.uses_count })
        .eq("id", promo.id);
      throw new Error(insErr.message);
    }

    return {
      success: true,
      tier: promo.access_tier as "premium" | "premium_plus" | "beta",
      expiresAt: redemptionExpiresAt,
    };
  });

// ---------- admin ----------

export const listPromoCodes = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("promo_codes")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return { codes: data ?? [] };
  });

const createSchema = z.object({
  name: z.string().trim().max(120).optional().nullable(),
  code: z.string().trim().min(4).max(32).optional().nullable(),
  accessTier: z.enum(["premium", "premium_plus", "beta"]).default("premium"),
  maxUses: z.number().int().positive().nullable().optional(),
  expiresAt: z.string().datetime().nullable().optional(),
  durationDays: z.number().int().positive().nullable().optional(),
});

export const createPromoCode = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => createSchema.parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const code = (data.code?.trim() || generateCode(10)).toUpperCase();
    const { data: row, error } = await supabaseAdmin
      .from("promo_codes")
      .insert({
        code,
        name: data.name ?? null,
        access_tier: data.accessTier,
        max_uses: data.maxUses ?? null,
        expires_at: data.expiresAt ?? null,
        duration_days: data.durationDays ?? null,
        created_by: context.userId,
      })
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return { code: row };
  });

const updateSchema = z.object({
  id: z.string().uuid(),
  name: z.string().trim().max(120).nullable().optional(),
  isActive: z.boolean().optional(),
  maxUses: z.number().int().positive().nullable().optional(),
  expiresAt: z.string().datetime().nullable().optional(),
  durationDays: z.number().int().positive().nullable().optional(),
  accessTier: z.enum(["premium", "premium_plus", "beta"]).optional(),
});

export const updatePromoCode = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => updateSchema.parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const patch: {
      name?: string | null;
      is_active?: boolean;
      max_uses?: number | null;
      expires_at?: string | null;
      duration_days?: number | null;
      access_tier?: "premium" | "premium_plus" | "beta";
    } = {};
    if (data.name !== undefined) patch.name = data.name;
    if (data.isActive !== undefined) patch.is_active = data.isActive;
    if (data.maxUses !== undefined) patch.max_uses = data.maxUses;
    if (data.expiresAt !== undefined) patch.expires_at = data.expiresAt;
    if (data.durationDays !== undefined) patch.duration_days = data.durationDays;
    if (data.accessTier !== undefined) patch.access_tier = data.accessTier;
    const { data: row, error } = await supabaseAdmin
      .from("promo_codes")
      .update(patch)
      .eq("id", data.id)
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return { code: row };
  });

export const deletePromoCode = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("promo_codes").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { success: true };
  });