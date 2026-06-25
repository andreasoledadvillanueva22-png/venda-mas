-- ============================================================================
-- Retiro en local por tienda
-- Ejecutar en Supabase SQL Editor o via CLI de migraciones.
-- ============================================================================

ALTER TABLE stores
  ADD COLUMN IF NOT EXISTS enable_local_pickup BOOLEAN DEFAULT false;

ALTER TABLE stores
  ADD COLUMN IF NOT EXISTS pickup_address TEXT;

ALTER TABLE stores
  ADD COLUMN IF NOT EXISTS pickup_instructions TEXT;

ALTER TABLE stores
  ADD COLUMN IF NOT EXISTS pickup_schedule TEXT;

COMMENT ON COLUMN stores.enable_local_pickup IS 'Indica si la tienda ofrece retiro en local';
COMMENT ON COLUMN stores.pickup_address IS 'Dirección del local para retiro de pedidos';
COMMENT ON COLUMN stores.pickup_instructions IS 'Instrucciones para el cliente al retirar';
COMMENT ON COLUMN stores.pickup_schedule IS 'Horarios de retiro en el local';

-- Permitir shipping_method = local_pickup en pedidos
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_shipping_method_check;

ALTER TABLE orders
  ADD CONSTRAINT orders_shipping_method_check
  CHECK (
    shipping_method IN ('standard', 'express', 'free', 'local_pickup')
    OR shipping_method IS NULL
  );
