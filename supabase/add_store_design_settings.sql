-- Configuración de diseño por tienda (tema, homepage, páginas, tipografía)
-- Ejecutar en Supabase SQL Editor.

CREATE TABLE IF NOT EXISTS store_design_settings (
  store_id UUID PRIMARY KEY REFERENCES stores(id) ON DELETE CASCADE,
  theme_id TEXT NOT NULL DEFAULT 'moderno',
  theme_colors JSONB NOT NULL DEFAULT '{"primary":"#DC2626","secondary":"#16A34A","background":"#FFFFFF","text":"#1E293B"}'::jsonb,
  homepage_config JSONB NOT NULL DEFAULT '{"title":"","subtitle":"","ctaText":"Comprar ahora","ctaLink":"/productos","layout":"grid"}'::jsonb,
  pages_config JSONB NOT NULL DEFAULT '{}'::jsonb,
  font_heading TEXT NOT NULL DEFAULT 'Inter',
  font_body TEXT NOT NULL DEFAULT 'Inter',
  base_font_size INTEGER NOT NULL DEFAULT 16 CHECK (base_font_size >= 14 AND base_font_size <= 20),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE store_design_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Propietarios ven diseño de su tienda" ON store_design_settings;
CREATE POLICY "Propietarios ven diseño de su tienda"
  ON store_design_settings FOR SELECT
  USING (store_id IN (SELECT id FROM stores WHERE owner_id = auth.uid()));

DROP POLICY IF EXISTS "Propietarios crean diseño de su tienda" ON store_design_settings;
CREATE POLICY "Propietarios crean diseño de su tienda"
  ON store_design_settings FOR INSERT
  WITH CHECK (store_id IN (SELECT id FROM stores WHERE owner_id = auth.uid()));

DROP POLICY IF EXISTS "Propietarios actualizan diseño de su tienda" ON store_design_settings;
CREATE POLICY "Propietarios actualizan diseño de su tienda"
  ON store_design_settings FOR UPDATE
  USING (store_id IN (SELECT id FROM stores WHERE owner_id = auth.uid()))
  WITH CHECK (store_id IN (SELECT id FROM stores WHERE owner_id = auth.uid()));

GRANT SELECT, INSERT, UPDATE ON store_design_settings TO authenticated;

COMMENT ON TABLE store_design_settings IS 'Configuración visual del storefront por tienda';
