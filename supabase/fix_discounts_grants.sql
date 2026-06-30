-- Fix permisos de descuentos para el admin (INSERT/UPDATE)
GRANT SELECT, INSERT, UPDATE, DELETE ON discounts TO authenticated;
