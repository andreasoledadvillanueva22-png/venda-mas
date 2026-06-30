-- Redes sociales adicionales en el footer del storefront
-- Ejecutar en Supabase SQL Editor

ALTER TABLE stores
  ADD COLUMN IF NOT EXISTS footer_tiktok TEXT,
  ADD COLUMN IF NOT EXISTS footer_twitter TEXT;
