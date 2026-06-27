-- Contenido configurable del storefront: footer y testimonios
-- Ejecutar en Supabase SQL Editor

ALTER TABLE stores
  ADD COLUMN IF NOT EXISTS footer_email TEXT,
  ADD COLUMN IF NOT EXISTS footer_phone TEXT,
  ADD COLUMN IF NOT EXISTS footer_address TEXT,
  ADD COLUMN IF NOT EXISTS footer_whatsapp TEXT,
  ADD COLUMN IF NOT EXISTS footer_instagram TEXT,
  ADD COLUMN IF NOT EXISTS footer_facebook TEXT;

CREATE TABLE IF NOT EXISTS testimonials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  customer_name TEXT NOT NULL,
  customer_location TEXT,
  product_name TEXT,
  rating INTEGER DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
  comment TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_testimonials_store_id ON testimonials(store_id);

ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Testimonios son públicos" ON testimonials;

CREATE POLICY "Testimonios son públicos"
  ON testimonials FOR SELECT
  USING (TRUE);

DROP POLICY IF EXISTS "Propietarios pueden crear testimonios" ON testimonials;

CREATE POLICY "Propietarios pueden crear testimonios"
  ON testimonials FOR INSERT
  WITH CHECK (
    store_id IN (
      SELECT id FROM stores WHERE owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Propietarios pueden actualizar testimonios" ON testimonials;

CREATE POLICY "Propietarios pueden actualizar testimonios"
  ON testimonials FOR UPDATE
  USING (
    store_id IN (
      SELECT id FROM stores WHERE owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Propietarios pueden eliminar testimonios" ON testimonials;

CREATE POLICY "Propietarios pueden eliminar testimonios"
  ON testimonials FOR DELETE
  USING (
    store_id IN (
      SELECT id FROM stores WHERE owner_id = auth.uid()
    )
  );
