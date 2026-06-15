-- ============================================================================
-- Mercado Pago OAuth — columnas en stores
-- Ejecutar en Supabase SQL Editor o via CLI de migraciones.
-- ============================================================================

ALTER TABLE stores
  ADD COLUMN IF NOT EXISTS mp_access_token TEXT,
  ADD COLUMN IF NOT EXISTS mp_public_key TEXT,
  ADD COLUMN IF NOT EXISTS mp_user_id TEXT;

COMMENT ON COLUMN stores.mp_access_token IS 'Access token OAuth de Mercado Pago para cobrar en nombre del vendedor';
COMMENT ON COLUMN stores.mp_public_key IS 'Public key de Mercado Pago para integraciones en el frontend';
COMMENT ON COLUMN stores.mp_user_id IS 'ID del usuario/vendedor conectado en Mercado Pago';
