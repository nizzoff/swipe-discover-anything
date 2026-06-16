-- Promo codes table
CREATE TABLE promo_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  discount_percent INTEGER CHECK (discount_percent >= 0 AND discount_percent <= 100),
  discount_amount_cents INTEGER CHECK (discount_amount_cents >= 0),
  plan_type TEXT CHECK (plan_type IS NULL OR plan_type IN ('monthly', 'annual', 'lifetime')),
  max_uses INTEGER DEFAULT NULL,
  uses_count INTEGER DEFAULT 0,
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT has_discount CHECK (discount_percent IS NOT NULL OR discount_amount_cents IS NOT NULL)
);

-- Track promo code redemptions
CREATE TABLE promo_redemptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  promo_code_id UUID NOT NULL REFERENCES promo_codes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(promo_code_id, user_id)
);

-- Enable RLS
ALTER TABLE promo_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE promo_redemptions ENABLE ROW LEVEL SECURITY;

-- Promo codes are readable by all authenticated users (to check validity)
CREATE POLICY "select_promo_codes" ON promo_codes FOR SELECT
  TO authenticated USING (is_active = true);

-- Service role can manage promo codes
CREATE POLICY "service_promo_codes" ON promo_codes FOR ALL
  TO service_role USING (true) WITH CHECK (true);

-- Users can see their own redemptions
CREATE POLICY "select_own_redemptions" ON promo_redemptions FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

-- Service role can manage redemptions
CREATE POLICY "service_redemptions" ON promo_redemptions FOR ALL
  TO service_role USING (true) WITH CHECK (true);

-- Indexes
CREATE INDEX idx_promo_codes_code ON promo_codes(code);
CREATE INDEX idx_promo_redemptions_user ON promo_redemptions(user_id);
CREATE INDEX idx_promo_redemptions_promo ON promo_redemptions(promo_code_id);