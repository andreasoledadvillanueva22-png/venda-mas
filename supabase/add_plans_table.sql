-- Tabla de planes y suscripciones
-- Ejecutar en Supabase SQL Editor

CREATE TABLE IF NOT EXISTS plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  price_monthly INTEGER NOT NULL,
  price_yearly INTEGER,
  description TEXT,
  features JSONB DEFAULT '[]'::jsonb,
  limits JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT TRUE,
  is_popular BOOLEAN DEFAULT FALSE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
  plan_id UUID REFERENCES plans(id),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired', 'trial')),
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  trial_ends_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE stores ADD COLUMN IF NOT EXISTS plan_id UUID REFERENCES plans(id);

ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON plans TO anon;
GRANT ALL ON plans TO authenticated;
GRANT ALL ON subscriptions TO authenticated;

DROP POLICY IF EXISTS "Planes son públicos" ON plans;
CREATE POLICY "Planes son públicos"
  ON plans FOR SELECT
  USING (TRUE);

DROP POLICY IF EXISTS "Usuarios ven sus suscripciones" ON subscriptions;
CREATE POLICY "Usuarios ven sus suscripciones"
  ON subscriptions FOR SELECT
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Usuarios crean sus suscripciones" ON subscriptions;
CREATE POLICY "Usuarios crean sus suscripciones"
  ON subscriptions FOR INSERT
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Usuarios actualizan sus suscripciones" ON subscriptions;
CREATE POLICY "Usuarios actualizan sus suscripciones"
  ON subscriptions FOR UPDATE
  USING (user_id = auth.uid());
