-- Políticas RLS adicionales para multi-tenant seguro
-- Ejecutar en Supabase SQL Editor

-- Perfiles: permitir que el usuario cree su propio perfil al registrarse
DROP POLICY IF EXISTS "Usuarios pueden crear su propio perfil" ON profiles;

CREATE POLICY "Usuarios pueden crear su propio perfil"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Pedidos: propietarios pueden actualizar pedidos de su tienda
DROP POLICY IF EXISTS "Propietarios pueden actualizar pedidos de su tienda" ON orders;

CREATE POLICY "Propietarios pueden actualizar pedidos de su tienda"
  ON orders FOR UPDATE
  USING (
    store_id IN (
      SELECT id FROM stores WHERE owner_id = auth.uid()
    )
  );

-- Productos: propietarios pueden eliminar productos de su tienda
DROP POLICY IF EXISTS "Propietarios pueden eliminar sus productos" ON products;

CREATE POLICY "Propietarios pueden eliminar sus productos"
  ON products FOR DELETE
  USING (
    store_id IN (
      SELECT id FROM stores WHERE owner_id = auth.uid()
    )
  );

-- Productos: propietarios pueden ver todos sus productos (activos e inactivos)
DROP POLICY IF EXISTS "Productos activos son públicos" ON products;

CREATE POLICY "Productos activos son públicos"
  ON products FOR SELECT
  USING (
    active = TRUE
    OR store_id IN (
      SELECT id FROM stores WHERE owner_id = auth.uid()
    )
  );
