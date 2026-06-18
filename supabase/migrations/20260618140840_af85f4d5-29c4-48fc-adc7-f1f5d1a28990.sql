
-- Roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "select_own_roles" ON public.user_roles FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

-- Access tiers
CREATE TYPE public.access_tier AS ENUM ('premium', 'premium_plus', 'beta');

-- Promo codes
CREATE TABLE public.promo_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT,
  access_tier public.access_tier NOT NULL DEFAULT 'premium',
  max_uses INTEGER,
  uses_count INTEGER NOT NULL DEFAULT 0,
  duration_days INTEGER,
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.promo_codes TO authenticated;
GRANT ALL ON public.promo_codes TO service_role;
ALTER TABLE public.promo_codes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin_manage_promo_codes" ON public.promo_codes FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE INDEX idx_promo_codes_code ON public.promo_codes(code);

-- Promo redemptions
CREATE TABLE public.promo_redemptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  promo_code_id UUID NOT NULL REFERENCES public.promo_codes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  access_tier public.access_tier NOT NULL DEFAULT 'premium',
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (promo_code_id, user_id)
);
GRANT SELECT ON public.promo_redemptions TO authenticated;
GRANT ALL ON public.promo_redemptions TO service_role;
ALTER TABLE public.promo_redemptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "select_own_redemptions" ON public.promo_redemptions FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "admin_view_redemptions" ON public.promo_redemptions FOR SELECT
  TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX idx_promo_redemptions_user ON public.promo_redemptions(user_id);
CREATE INDEX idx_promo_redemptions_promo ON public.promo_redemptions(promo_code_id);

-- Active access helper
CREATE OR REPLACE FUNCTION public.user_active_promo(_user_id UUID)
RETURNS TABLE(tier public.access_tier, expires_at TIMESTAMPTZ)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT r.access_tier, LEAST(
    COALESCE(r.expires_at, 'infinity'::timestamptz),
    COALESCE(p.expires_at, 'infinity'::timestamptz)
  ) AS expires_at
  FROM public.promo_redemptions r
  JOIN public.promo_codes p ON p.id = r.promo_code_id
  WHERE r.user_id = _user_id
    AND p.is_active = true
    AND (p.expires_at IS NULL OR p.expires_at > now())
    AND (r.expires_at IS NULL OR r.expires_at > now())
  ORDER BY r.created_at DESC
  LIMIT 1
$$;

-- updated_at trigger for promo_codes
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END $$;

CREATE TRIGGER promo_codes_updated_at
  BEFORE UPDATE ON public.promo_codes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
