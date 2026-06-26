-- Dominio personalizado self-service para tiendas
-- Ejecutar en Supabase SQL Editor

ALTER TABLE stores
  ADD COLUMN IF NOT EXISTS custom_domain TEXT,
  ADD COLUMN IF NOT EXISTS domain_verified BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS domain_verification_token TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS idx_stores_custom_domain
  ON stores (custom_domain)
  WHERE custom_domain IS NOT NULL;

COMMENT ON COLUMN stores.custom_domain IS 'Dominio personalizado del cliente (ej: andreatiendaonline.com)';
COMMENT ON COLUMN stores.domain_verified IS 'TRUE cuando el DNS de verificación está configurado correctamente';
COMMENT ON COLUMN stores.domain_verification_token IS 'Token TXT para verificar propiedad del dominio';
