-- Estados expandidos de suscripción
-- Ejecutar en Supabase SQL Editor

ALTER TABLE subscriptions
  ADD COLUMN IF NOT EXISTS detailed_status TEXT DEFAULT 'active';

ALTER TABLE subscriptions
  DROP CONSTRAINT IF EXISTS subscriptions_detailed_status_check;

ALTER TABLE subscriptions
  ADD CONSTRAINT subscriptions_detailed_status_check
  CHECK (detailed_status IN (
    'trial', 'active', 'past_due', 'grace_period',
    'cancelled', 'expired', 'suspended'
  ));

ALTER TABLE subscriptions
  ADD COLUMN IF NOT EXISTS next_billing_date TIMESTAMPTZ;

ALTER TABLE subscriptions
  ADD COLUMN IF NOT EXISTS retry_count INTEGER DEFAULT 0;

ALTER TABLE subscriptions
  ADD COLUMN IF NOT EXISTS cancellation_reason TEXT;

CREATE INDEX IF NOT EXISTS idx_subscriptions_detailed_status ON subscriptions(detailed_status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_next_billing_date ON subscriptions(next_billing_date);
