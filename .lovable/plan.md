## Goal
Replace Stripe-discount promo codes with **access-granting** promo codes: an admin creates codes, a user redeems one, and their account immediately gets Premium (no Stripe).

## Database (new migration)

Extend `promo_codes` + add roles & redemption-driven access:

1. **`app_role` enum** + `user_roles` table (`admin`, `user`) with `has_role(uuid, app_role)` SECURITY DEFINER helper. RLS: users read their own roles; only admins write.
2. **`access_tier` enum**: `premium`, `premium_plus`, `beta` (extensible).
3. **Alter `promo_codes`**:
   - add `name TEXT`, `access_tier access_tier NOT NULL DEFAULT 'premium'`, `duration_days INTEGER NULL` (NULL = lifetime while code active)
   - drop NOT NULL on discount columns / drop `has_discount` CHECK (legacy fields kept nullable for back-compat, unused going forward)
   - tighten RLS: SELECT only via server (revoke broad authenticated SELECT); admins full ALL via `has_role`
4. **`promo_redemptions`**: add `access_tier`, `expires_at NULL` (NULL = while code active). Keep UNIQUE(promo, user).
5. **GRANTs** for `authenticated` + `service_role` on all new/changed tables.
6. Seed: make the first signed-in user admin via SQL comment instructions (no auto-seed).

## Access logic

New helper `public.user_has_premium_access(uuid)` SECURITY DEFINER returns TRUE if:
- active `subscriptions` row (existing), OR
- any `promo_redemptions` row where the linked `promo_codes.is_active = true` AND (`expires_at` IS NULL OR future) AND redemption not individually expired.

`check-subscription` edge function updated to call this and return `hasAccess` accordingly with `accessReason: "promo"` + tier.

## Server functions (TanStack, replacing/augmenting edge fns)

Create `src/lib/promo.functions.ts`:
- `redeemPromoCode({ code })` — `requireSupabaseAuth`; server validates active/expires/max_uses/not-already-redeemed, inserts redemption, atomically increments `uses_count`. Returns `{ tier, expiresAt }`.
- `listPromoCodes()` — admin only (`has_role`); lists all codes with stats.
- `createPromoCode({ name, code?, accessTier, maxUses?, expiresAt?, durationDays? })` — admin only; auto-generates 8–12 char code if omitted.
- `updatePromoCode({ id, ... })` — admin only (toggle active, edit limits/dates).
- `deletePromoCode({ id })` — admin only.

All admin fns use `supabaseAdmin` (loaded inside handler) after `has_role` check.

## UI

- **`src/components/paywall.tsx`**: rework promo block into a primary "J'ai un code d'accès" flow — input + submit calls `redeemPromoCode`; on success refresh subscription and close paywall. Stripe plans remain below as secondary.
- **`src/routes/_authenticated/admin.promo-codes.tsx`** (new, gated by `has_role('admin')` server-side; non-admins see "Accès refusé"): table of codes with create dialog (name, tier select, max uses, expiry date, duration days, generate-code button), inline toggle active, delete with confirm.
- Add a discreet "Admin" link in `settings-panel` visible only when `has_role` returns true (server fn `isAdmin()`).

## Security

- All write/admin paths require `has_role(auth.uid(), 'admin')` server-side.
- Redemption validation done entirely in server function with admin client — client cannot self-grant.
- `uses_count` increment via SQL `UPDATE ... WHERE uses_count < max_uses` to prevent races.

## Files touched

- new: `supabase/migrations/<ts>_promo_access_system.sql`
- new: `src/lib/promo.functions.ts`
- new: `src/routes/_authenticated/admin.promo-codes.tsx`
- edit: `src/components/paywall.tsx` (redeem flow)
- edit: `src/components/settings-panel.tsx` (admin link)
- edit: `supabase/functions/check-subscription/index.ts` (include promo access)
- edit: `src/lib/use-subscription.ts` (expose `redeem`, new `accessReason: "promo"`)

## Out of scope (per request "prévoir plus tard")

UI for picking tier per code is included (enum select), but distinct gating per tier in app features is left for later — everything tier ≥ premium unlocks the same content for now.
