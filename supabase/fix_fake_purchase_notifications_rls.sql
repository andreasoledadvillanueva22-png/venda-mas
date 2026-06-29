-- ============================================================================
-- Fix: permisos y RLS de fake_purchase_notifications
-- Ejecutar si el admin no puede crear mensajes ficticios (error de INSERT/RLS).
-- ============================================================================

GRANT SELECT, INSERT, UPDATE, DELETE ON fake_purchase_notifications TO authenticated;
GRANT SELECT ON fake_purchase_notifications TO anon;

DROP POLICY IF EXISTS "Propietarios actualizan notificaciones ficticias" ON fake_purchase_notifications;
CREATE POLICY "Propietarios actualizan notificaciones ficticias"
  ON fake_purchase_notifications FOR UPDATE
  USING (
    store_id IN (SELECT id FROM stores WHERE owner_id = auth.uid())
  )
  WITH CHECK (
    store_id IN (SELECT id FROM stores WHERE owner_id = auth.uid())
  );
