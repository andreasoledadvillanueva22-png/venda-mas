-- Soporte para checkout como invitado
-- Ejecutar en Supabase SQL Editor

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS is_guest BOOLEAN NOT NULL DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL;

COMMENT ON COLUMN orders.is_guest IS 'TRUE si la compra fue realizada sin cuenta registrada';
COMMENT ON COLUMN orders.profile_id IS 'Perfil vinculado cuando el comprador estaba autenticado';

CREATE INDEX IF NOT EXISTS idx_orders_guest_lookup
  ON orders(store_id, customer_email, created_at DESC);

-- Permitir insertar ítems de pedido desde el checkout público (anon)
DROP POLICY IF EXISTS "Cualquiera puede crear items de pedido" ON order_items;

CREATE POLICY "Cualquiera puede crear items de pedido"
  ON order_items FOR INSERT
  WITH CHECK (TRUE);
