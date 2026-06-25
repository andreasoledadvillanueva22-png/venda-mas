-- ============================================================================
-- Datos bancarios para transferencia por tienda
-- Ejecutar en Supabase SQL Editor o via CLI de migraciones.
-- ============================================================================

ALTER TABLE stores
  ADD COLUMN IF NOT EXISTS bank_name TEXT;

ALTER TABLE stores
  ADD COLUMN IF NOT EXISTS cbu TEXT;

ALTER TABLE stores
  ADD COLUMN IF NOT EXISTS alias TEXT;

ALTER TABLE stores
  ADD COLUMN IF NOT EXISTS account_holder TEXT;

ALTER TABLE stores
  ADD COLUMN IF NOT EXISTS cuit TEXT;

COMMENT ON COLUMN stores.bank_name IS 'Nombre del banco para transferencias';
COMMENT ON COLUMN stores.cbu IS 'CBU completo para recibir transferencias';
COMMENT ON COLUMN stores.alias IS 'Alias CBU para recibir transferencias';
COMMENT ON COLUMN stores.account_holder IS 'Titular de la cuenta bancaria';
COMMENT ON COLUMN stores.cuit IS 'CUIT del titular de la cuenta';

-- Permitir payment_method = bank_transfer en pedidos
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_payment_method_check;

ALTER TABLE orders
  ADD CONSTRAINT orders_payment_method_check
  CHECK (
    payment_method IN ('mercadopago', 'transfer', 'bank_transfer', 'effectivo')
    OR payment_method IS NULL
  );
