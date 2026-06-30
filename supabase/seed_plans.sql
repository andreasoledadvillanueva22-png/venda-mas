-- Seed de planes VendaMás
-- Ejecutar después de add_plans_table.sql

INSERT INTO plans (name, slug, price_monthly, price_yearly, description, features, limits, is_active, is_popular, sort_order) VALUES
('Gratis', 'free', 0, 0, 'Perfecto para probar la plataforma',
  '["Hasta 10 productos", "20 órdenes por mes", "1 usuario", "Soporte por email", "Dominio vendemas.app"]'::jsonb,
  '{"products": 10, "orders_per_month": 20, "users": 1}'::jsonb,
  TRUE, FALSE, 1),

('Emprendedor', 'emprendedor', 9900, 99000, 'Ideal para quienes están empezando a vender online',
  '["Hasta 50 productos", "200 órdenes por mes", "1 usuario", "Dominio personalizado", "Soporte por email", "Sin comisiones por venta", "Tarjeta + Efectivo + Transferencia", "Envíos con Andreani y Correo Argentino (próximamente)"]'::jsonb,
  '{"products": 50, "orders_per_month": 200, "users": 1}'::jsonb,
  TRUE, FALSE, 2),

('Negocio', 'negocio', 19900, 199000, 'Para negocios en crecimiento que necesitan más',
  '["Hasta 200 productos", "1000 órdenes por mes", "3 usuarios", "Dominio personalizado", "Soporte prioritario", "Sin comisiones por venta", "Tarjeta + Efectivo + Transferencia", "Analytics avanzado", "Email marketing", "Cupones y descuentos"]'::jsonb,
  '{"products": 200, "orders_per_month": 1000, "users": 3}'::jsonb,
  TRUE, TRUE, 3),

('Empresa', 'empresa', 39900, 399000, 'Para empresas con alto volumen de ventas',
  '["Productos ilimitados", "Órdenes ilimitadas", "Usuarios ilimitados", "Dominio personalizado", "Soporte 24/7", "Sin comisiones por venta", "Múltiples medios de pago", "Analytics avanzado", "Email marketing", "API access", "Manager de cuenta dedicado"]'::jsonb,
  '{"products": -1, "orders_per_month": -1, "users": -1}'::jsonb,
  TRUE, FALSE, 4)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  price_monthly = EXCLUDED.price_monthly,
  price_yearly = EXCLUDED.price_yearly,
  description = EXCLUDED.description,
  features = EXCLUDED.features,
  limits = EXCLUDED.limits,
  is_active = EXCLUDED.is_active,
  is_popular = EXCLUDED.is_popular,
  sort_order = EXCLUDED.sort_order;
