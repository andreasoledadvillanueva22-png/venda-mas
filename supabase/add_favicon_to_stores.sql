-- Favicon configurable por tienda
-- Ejecutar en Supabase SQL Editor

ALTER TABLE stores
  ADD COLUMN IF NOT EXISTS favicon_url TEXT;

COMMENT ON COLUMN stores.favicon_url IS 'URL del favicon del storefront (ico, png, svg, etc.)';
