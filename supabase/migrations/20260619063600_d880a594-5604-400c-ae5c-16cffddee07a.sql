ALTER TABLE public.promo_codes ADD COLUMN IF NOT EXISTS grants_admin boolean NOT NULL DEFAULT false;

INSERT INTO public.promo_codes (code, name, access_tier, max_uses, expires_at, duration_days, is_active, grants_admin)
VALUES ('BATOUTEST', 'BatouTest', 'premium_plus', NULL, NULL, NULL, true, true)
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  access_tier = EXCLUDED.access_tier,
  max_uses = EXCLUDED.max_uses,
  expires_at = EXCLUDED.expires_at,
  duration_days = EXCLUDED.duration_days,
  is_active = true,
  grants_admin = true;