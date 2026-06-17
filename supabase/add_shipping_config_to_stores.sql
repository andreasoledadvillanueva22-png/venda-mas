-- ============================================================================
-- Configuración de envíos por tienda
-- Ejecutar en Supabase SQL Editor o via CLI de migraciones.
-- ============================================================================

ALTER TABLE stores
  ADD COLUMN IF NOT EXISTS free_shipping_threshold NUMERIC DEFAULT 50000;

ALTER TABLE stores
  ADD COLUMN IF NOT EXISTS shipping_standard_cost NUMERIC DEFAULT 5000;

ALTER TABLE stores
  ADD COLUMN IF NOT EXISTS shipping_express_cost NUMERIC DEFAULT 8500;

ALTER TABLE stores
  ADD COLUMN IF NOT EXISTS free_shipping_enabled BOOLEAN DEFAULT true;

COMMENT ON COLUMN stores.free_shipping_threshold IS 'Monto mínimo de compra para envío gratis por umbral de carrito';
COMMENT ON COLUMN stores.shipping_standard_cost IS 'Costo del envío estándar cuando no aplica envío gratis';
COMMENT ON COLUMN stores.shipping_express_cost IS 'Costo del envío express cuando no aplica envío gratis';
COMMENT ON COLUMN stores.free_shipping_enabled IS 'Indica si la tienda ofrece envío gratis por umbral de compra';
