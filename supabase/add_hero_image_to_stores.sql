-- ============================================================================
-- Imagen del hero por tienda
-- Ejecutar en Supabase SQL Editor o via CLI de migraciones.
-- ============================================================================

ALTER TABLE stores
  ADD COLUMN IF NOT EXISTS hero_image_url TEXT;

COMMENT ON COLUMN stores.hero_image_url IS 'URL de la imagen principal del hero en el storefront';
