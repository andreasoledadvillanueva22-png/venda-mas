-- ============================================================================
-- Video de producto y reseñas importadas
-- Ejecutar en Supabase SQL Editor o via CLI de migraciones.
-- ============================================================================

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS video_url TEXT;

COMMENT ON COLUMN products.video_url IS 'URL de video del producto (YouTube, Vimeo o MP4 directo)';

CREATE TABLE IF NOT EXISTS product_reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  source TEXT NOT NULL CHECK (source IN ('mercadolibre', 'amazon', 'aliexpress', 'manual')),
  source_url TEXT,
  customer_name TEXT NOT NULL,
  rating INTEGER NOT NULL DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
  comment TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_product_reviews_product
  ON product_reviews(product_id);

CREATE INDEX IF NOT EXISTS idx_product_reviews_store
  ON product_reviews(store_id);

ALTER TABLE product_reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Reseñas de producto son públicas" ON product_reviews;
CREATE POLICY "Reseñas de producto son públicas"
  ON product_reviews FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Propietarios crean reseñas" ON product_reviews;
CREATE POLICY "Propietarios crean reseñas"
  ON product_reviews FOR INSERT
  WITH CHECK (
    store_id IN (SELECT id FROM stores WHERE owner_id = auth.uid())
  );

DROP POLICY IF EXISTS "Propietarios actualizan reseñas" ON product_reviews;
CREATE POLICY "Propietarios actualizan reseñas"
  ON product_reviews FOR UPDATE
  USING (
    store_id IN (SELECT id FROM stores WHERE owner_id = auth.uid())
  );

DROP POLICY IF EXISTS "Propietarios eliminan reseñas" ON product_reviews;
CREATE POLICY "Propietarios eliminan reseñas"
  ON product_reviews FOR DELETE
  USING (
    store_id IN (SELECT id FROM stores WHERE owner_id = auth.uid())
  );

COMMENT ON TABLE product_reviews IS 'Reseñas importadas o manuales mostradas en la página de producto';
