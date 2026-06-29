-- ============================================================================
-- Pop-ups de urgencia ficticios por tienda (hasta 10 mensajes activos)
-- Ejecutar en Supabase SQL Editor o via CLI de migraciones.
-- ============================================================================

CREATE TABLE IF NOT EXISTS fake_purchase_notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  customer_name TEXT NOT NULL,
  customer_city TEXT NOT NULL,
  product_name TEXT NOT NULL,
  minutes_ago INTEGER NOT NULL DEFAULT 5 CHECK (minutes_ago >= 1 AND minutes_ago <= 120),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_fake_notifications_store
  ON fake_purchase_notifications(store_id);

CREATE INDEX IF NOT EXISTS idx_fake_notifications_store_active
  ON fake_purchase_notifications(store_id, is_active);

ALTER TABLE fake_purchase_notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Notificaciones ficticias activas son públicas" ON fake_purchase_notifications;
CREATE POLICY "Notificaciones ficticias activas son públicas"
  ON fake_purchase_notifications FOR SELECT
  USING (is_active = true);

DROP POLICY IF EXISTS "Propietarios ven notificaciones ficticias" ON fake_purchase_notifications;
CREATE POLICY "Propietarios ven notificaciones ficticias"
  ON fake_purchase_notifications FOR SELECT
  USING (
    store_id IN (SELECT id FROM stores WHERE owner_id = auth.uid())
  );

DROP POLICY IF EXISTS "Propietarios crean notificaciones ficticias" ON fake_purchase_notifications;
CREATE POLICY "Propietarios crean notificaciones ficticias"
  ON fake_purchase_notifications FOR INSERT
  WITH CHECK (
    store_id IN (SELECT id FROM stores WHERE owner_id = auth.uid())
  );

DROP POLICY IF EXISTS "Propietarios actualizan notificaciones ficticias" ON fake_purchase_notifications;
CREATE POLICY "Propietarios actualizan notificaciones ficticias"
  ON fake_purchase_notifications FOR UPDATE
  USING (
    store_id IN (SELECT id FROM stores WHERE owner_id = auth.uid())
  );

DROP POLICY IF EXISTS "Propietarios eliminan notificaciones ficticias" ON fake_purchase_notifications;
CREATE POLICY "Propietarios eliminan notificaciones ficticias"
  ON fake_purchase_notifications FOR DELETE
  USING (
    store_id IN (SELECT id FROM stores WHERE owner_id = auth.uid())
  );

COMMENT ON TABLE fake_purchase_notifications IS 'Mensajes ficticios de compra reciente para pop-ups de urgencia en el storefront';
