-- ============================================================================
-- Mercado Pago — preferencia de pago en pedidos
-- ============================================================================

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS mp_preference_id TEXT;

ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check;

ALTER TABLE orders
  ADD CONSTRAINT orders_status_check
  CHECK (status IN ('pending', 'pending_payment', 'paid', 'shipped', 'delivered', 'cancelled'));

COMMENT ON COLUMN orders.mp_preference_id IS 'ID de preferencia de pago creada en Mercado Pago';
