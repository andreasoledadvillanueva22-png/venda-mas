-- ============================================================================
-- Fix: permisos y RLS de product_reviews
-- Ejecutar si el admin no puede crear reseñas (error de INSERT/RLS o GRANT).
-- ============================================================================

GRANT SELECT ON product_reviews TO anon;
GRANT ALL ON product_reviews TO authenticated;

-- Política SELECT pública (cualquiera puede ver reseñas)
DROP POLICY IF EXISTS "Reseñas de producto son públicas" ON product_reviews;
DROP POLICY IF EXISTS "Reseñas son públicas" ON product_reviews;
CREATE POLICY "Reseñas son públicas"
  ON product_reviews FOR SELECT
  USING (TRUE);

-- Política INSERT para owners de la tienda
DROP POLICY IF EXISTS "Propietarios crean reseñas" ON product_reviews;
DROP POLICY IF EXISTS "Owners pueden crear reseñas" ON product_reviews;
CREATE POLICY "Owners pueden crear reseñas"
  ON product_reviews FOR INSERT
  WITH CHECK (
    store_id IN (
      SELECT id FROM stores WHERE owner_id = auth.uid()
    )
  );

-- Política UPDATE para owners
DROP POLICY IF EXISTS "Propietarios actualizan reseñas" ON product_reviews;
DROP POLICY IF EXISTS "Owners pueden actualizar reseñas" ON product_reviews;
CREATE POLICY "Owners pueden actualizar reseñas"
  ON product_reviews FOR UPDATE
  USING (
    store_id IN (
      SELECT id FROM stores WHERE owner_id = auth.uid()
    )
  )
  WITH CHECK (
    store_id IN (
      SELECT id FROM stores WHERE owner_id = auth.uid()
    )
  );

-- Política DELETE para owners
DROP POLICY IF EXISTS "Propietarios eliminan reseñas" ON product_reviews;
DROP POLICY IF EXISTS "Owners pueden eliminar reseñas" ON product_reviews;
CREATE POLICY "Owners pueden eliminar reseñas"
  ON product_reviews FOR DELETE
  USING (
    store_id IN (
      SELECT id FROM stores WHERE owner_id = auth.uid()
    )
  );
